import Capacitor
import Foundation

/// See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
fileprivate enum ResponseType: String {
    case arrayBuffer = "arraybuffer"
    case blob = "blob"
    case document = "document"
    case json = "json"
    case text = "text"

    static let `default`: ResponseType = .text

    init(string: String?) {
        guard let string = string else {
            self = .default
            return
        }

        guard let responseType = ResponseType(rawValue: string.lowercased()) else {
            self = .default
            return
        }

        self = responseType
    }
}

/// Helper that safely parses JSON Data. Otherwise returns an error (without throwing)
/// - Parameters:
///     - data: The JSON Data to parse
/// - Returns: The parsed value or an error
func tryParseJson(_ data: Data) -> Any {
  do {
    return try JSONSerialization.jsonObject(with: data, options: .mutableContainers)
  } catch {
    return error.localizedDescription
  }
}

class UploadOperation : Operation {

    private var task : URLSessionDataTask!

    enum OperationState : Int {
        case ready
        case executing
        case finished
    }

    // default state is ready (when the operation is created)
    private var state : OperationState = .ready {
        willSet {
            self.willChangeValue(forKey: "isExecuting")
            self.willChangeValue(forKey: "isFinished")
        }

        didSet {
            self.didChangeValue(forKey: "isExecuting")
            self.didChangeValue(forKey: "isFinished")
        }
    }

    override var isReady: Bool { return state == .ready }
    override var isExecuting: Bool { return state == .executing }
    override var isFinished: Bool { return state == .finished }

    init(session: URLSession, uploadTaskURL: URLRequest, completionHandler: ((Data?, URLResponse?, Error?) -> Void)?) {
        super.init()

        // use weak self to prevent retain cycle
        task = session.dataTask(with: uploadTaskURL, completionHandler: { [weak self] (data, response, error) in

            /*
            if there is a custom completionHandler defined,
            pass the result gotten in uploadTask's completionHandler to the
            custom completionHandler
            */
            if let completionHandler = completionHandler {
                // localURL is the temporary URL the uploaded file is located
                completionHandler(data, response, error)
            }

           /*
             set the operation state to finished once
             the upload task is completed or have error
           */
            self?.state = .finished
        })
    }

    override func start() {
      /*
      if the operation or queue got cancelled even
      before the operation has started, set the
      operation state to finished and return
      */
      if(self.isCancelled) {
          state = .finished
          return
      }

      // set the state to executing
      state = .executing

      print("uploading \(self.task.originalRequest?.url?.absoluteString ?? "")")

      // start the uploading
      self.task.resume()
  }

  override func cancel() {
      super.cancel()

      // cancel the uploading
      self.task.cancel()
  }
}

class HttpRequestHandler {
    private class CapacitorHttpRequestBuilder {
        private var url: URL?
        private var method: String?
        private var params: [String:String]?
        private var request: CapacitorUrlRequest?

        /// Set the URL of the HttpRequest
        /// - Throws: an error of URLError if the urlString cannot be parsed
        /// - Parameters:
        ///     - urlString: The URL value to parse
        /// - Returns: self to continue chaining functions
        public func setUrl(_ urlString: String) throws -> CapacitorHttpRequestBuilder {
            guard let u = URL(string: urlString) else {
                throw URLError(.badURL)
            }
            url = u
            return self
        }

        public func setMethod(_ method: String) -> CapacitorHttpRequestBuilder {
            self.method = method;
            return self
        }

        public func setUrlParams(_ params: [String:Any]) -> CapacitorHttpRequestBuilder {
            if (params.count != 0) {
                var cmps = URLComponents(url: url!, resolvingAgainstBaseURL: true)
                if cmps?.queryItems == nil {
                    cmps?.queryItems = []
                }

                var urlSafeParams: [URLQueryItem] = []
                for (key, value) in params {
                    if let arr = value as? [String] {
                        arr.forEach { str in
                            urlSafeParams.append(URLQueryItem(name: key, value: str))
                        }
                    } else {
                        urlSafeParams.append(URLQueryItem(name: key, value: (value as! String)))
                    }
                }

                cmps!.queryItems?.append(contentsOf: urlSafeParams)
                url = cmps!.url!
            }
            return self
        }

        public func openConnection() -> CapacitorHttpRequestBuilder {
            request = CapacitorUrlRequest(url!, method: method!)
            return self
        }

        public func build() -> CapacitorUrlRequest {
            return request!
        }
    }

    private static func buildResponse(_ data: Data?, _ response: HTTPURLResponse, responseType: ResponseType = .default) -> [String:Any] {
        var output = [:] as [String:Any]

        output["status"] = response.statusCode
        output["headers"] = response.allHeaderFields
        output["url"] = response.url?.absoluteString

        guard let data = data else {
            output["data"] = ""
            return output
        }

        let contentType = (response.allHeaderFields["Content-Type"] as? String ?? "application/default").lowercased();

        if (contentType.contains("application/json") || responseType == .json) {
            output["data"] = tryParseJson(data);
        } else if (responseType == .arrayBuffer || responseType == .blob) {
            output["data"] = data.base64EncodedString();
        } else if (responseType == .document || responseType == .text || responseType == .default) {
            output["data"] = String(data: data, encoding: .utf8)
        }

        return output
    }

    private static func generateMultipartForm(_ url: URL, _ name: String, _ boundary: String, _ body: [String:Any]) throws -> Data {
        let strings: [String: String] = body.compactMapValues { any in
            any as? String
        }

        var data = Data()

        let fileData = try Data(contentsOf: url)

        let fname = url.lastPathComponent
        let mimeType = FilesystemUtils.mimeTypeForPath(path: fname)
        data.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
        data.append(
          "Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(fname)\"\r\n".data(
            using: .utf8)!)
        data.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        data.append(fileData)
        strings.forEach { key, value in
            data.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
            data.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
            data.append(value.data(using: .utf8)!)
        }
        data.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

        return data
    }

    private static func generateMultipartFormForChunk(_ blob: Data, _ url: URL, _ name: String, _ boundary: String, _ body: [String:Any]) -> Data {
        let strings: [String: String] = body.compactMapValues { any in
            any as? String
        }

        var data = Data()

        let fname = url.lastPathComponent
        let mimeType = FilesystemUtils.mimeTypeForPath(path: fname)
        let customTagKey = "tags"

        strings.forEach { key, value in
            data.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
            if let range = key.range(of: "tag") {
                data.append("Content-Disposition: form-data; name=\"\(customTagKey)\"\r\n\r\n".data(using: .utf8)!)
            } else {
                data.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
            }

            data.append(value.data(using: .utf8)!)
        }
        data.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
        data.append(
            "Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(fname)\"\r\n".data(
                using: .utf8)!)
        data.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        data.append(blob)

        data.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

        return data
    }

    private static func getFileData(_ url: URL) throws -> Data {

        let fileData = try Data(contentsOf: url)
        return fileData
    }

    private static func getChunksFromFileData(_ data: Data) throws -> [Data] {
        let dataLen = data.count
        let chunkSize = 4000000 // MB
        let fullChunks = Int(dataLen / chunkSize)
        let totalChunks = fullChunks + (dataLen - (fullChunks * chunkSize) > 0 ? 1 : 0)

        var chunks:[Data] = [Data]()
        for chunkCounter in 0..<totalChunks {
            var chunk:Data
            let chunkBase = chunkCounter * chunkSize
            var diff = chunkSize
            if(chunkCounter == totalChunks - 1) {
                diff = dataLen - chunkBase
            }

            let range:Range<Data.Index> = chunkBase..<(chunkBase + diff)
            chunk = data.subdata(in: range)

            chunks.append(chunk)
        }

        return chunks

    }


    public static func request(_ call: CAPPluginCall, _ httpMethod: String?) throws {
        guard let urlString = call.getString("url") else { throw URLError(.badURL) }
        guard let method = httpMethod ?? call.getString("method") else { throw URLError(.dataNotAllowed) }

        let headers = (call.getObject("headers") ?? [:]) as! [String: String]
        let params = (call.getObject("params") ?? [:]) as! [String: Any]
        let responseType = call.getString("responseType") ?? "text";
        let connectTimeout = call.getDouble("connectTimeout");
        let readTimeout = call.getDouble("readTimeout");

        let isHttpMutate = method == "DELETE" ||
            method == "PATCH" ||
            method == "POST" ||
            method == "PUT";

        let request = try! CapacitorHttpRequestBuilder()
            .setUrl(urlString)
            .setMethod(method)
            .setUrlParams(params)
            .openConnection()
            .build();

        request.setRequestHeaders(headers)

        // Timeouts in iOS are in seconds. So read the value in millis and divide by 1000
        let timeout = (connectTimeout ?? readTimeout ?? 600000.0) / 1000.0;
        request.setTimeout(timeout)

        if isHttpMutate {
            do {
                guard let data = call.jsObjectRepresentation["data"]
                else {
                    throw CapacitorUrlRequest.CapacitorUrlRequestError.serializationError("Invalid [ data ] argument")
                }

                try request.setRequestBody(data)
            } catch {
                // Explicitly reject if the http request body was not set successfully,
                // so as to not send a known malformed request, and to provide the developer with additional context.
                call.reject("Error", "REQUEST", error, [:])
                return;
            }
        }

        let urlRequest = request.getUrlRequest();
        let urlSession = request.getUrlSession(call);
        let task = urlSession.dataTask(with: urlRequest) { (data, response, error) in
            urlSession.invalidateAndCancel();
            if error != nil {
                call.reject("Error", "REQUEST", error, [:])
                return;
            }

            let type = ResponseType(rawValue: responseType) ?? .default
            call.resolve(self.buildResponse(data, response as! HTTPURLResponse, responseType: type))
        }

        task.resume();
    }

    public static func upload(_ call: CAPPluginCall) throws {
        let name = call.getString("name") ?? "file"
        let method = call.getString("method") ?? "POST"
        let fileDirectory = call.getString("fileDirectory") ?? "DOCUMENTS"
        let headers = (call.getObject("headers") ?? [:]) as! [String: String]
        let params = (call.getObject("params") ?? [:]) as! [String: Any]
        let body = (call.getObject("data") ?? [:]) as [String: Any]
        let responseType = call.getString("responseType") ?? "text";
        let connectTimeout = call.getDouble("connectTimeout");
        let readTimeout = call.getDouble("readTimeout");

        guard let urlString = call.getString("url") else { throw URLError(.badURL) }
        guard let filePath = call.getString("filePath") else { throw URLError(.badURL) }
        guard let fileUrl = FilesystemUtils.getFileUrl(filePath, fileDirectory) else { throw URLError(.badURL) }

        let request = try! CapacitorHttpRequestBuilder()
            .setUrl(urlString)
            .setMethod(method)
            .setUrlParams(params)
            .openConnection()
            .build();

        request.setRequestHeaders(headers)

        // Timeouts in iOS are in seconds. So read the value in millis and divide by 1000
        let timeout = (connectTimeout ?? readTimeout ?? 600000.0) / 1000.0;
        request.setTimeout(timeout)

        let boundary = UUID().uuidString
        request.setContentType("multipart/form-data; boundary=\(boundary)");

        guard let form = try? generateMultipartForm(fileUrl, name, boundary, body) else { throw URLError(.cannotCreateFile) }

        let urlRequest = request.getUrlRequest();
        let task = URLSession.shared.uploadTask(with: urlRequest, from: form) { (data, response, error) in
            if error != nil {
                CAPLog.print("Error on upload file", String(describing: data), String(describing: response), String(describing: error))
                call.reject("Error", "UPLOAD", error, [:])
                return
            }
            let type = ResponseType(rawValue: responseType) ?? .default
            call.resolve(self.buildResponse(data, response as! HTTPURLResponse, responseType: type))
        }

        task.resume()
    }

    public static func chunkUpload(_ call: CAPPluginCall) throws {
        let name = call.getString("name") ?? "file"
        let method = call.getString("method") ?? "POST"
        let fileDirectory = call.getString("fileDirectory") ?? "DOCUMENTS"
        let headers = (call.getObject("headers") ?? [:]) as! [String: String]
        var params = (call.getObject("params") ?? [:]) as! [String: Any]
        var body = (call.getObject("data") ?? [:]) as [String: Any]
        let responseType = call.getString("responseType") ?? "text";
        let connectTimeout = call.getDouble("connectTimeout");
        let readTimeout = call.getDouble("readTimeout");

        guard let urlString = call.getString("url") else { throw URLError(.badURL) }
        guard let filePath = call.getString("filePath") else { throw URLError(.badURL) }
        guard let fileUrl = FilesystemUtils.getFileUrl(filePath, fileDirectory) else { throw URLError(.badURL) }


        guard let fileData = try? getFileData(fileUrl) else {throw URLError(.cannotOpenFile)}
        guard let chunks = try? getChunksFromFileData(fileData) else {throw URLError(.cannotCreateFile)}



        let queue = OperationQueue()
        queue.maxConcurrentOperationCount = 1

        let a = Int64((Date().timeIntervalSince1970 * 1000.0).rounded())
        let timestamp = String(a)
        let flowIdentifier = "\(timestamp)_\(fileData.count)_\(fileUrl.lastPathComponent)"
        let flowChunkSize = 4000000
        let flowTotalChunks = chunks.count
        let flowTotalSize = fileData.count

        for (index, chunk) in chunks.enumerated() {
            let flowChunkNumber = index + 1
            let currentChunkSize = chunk.count

            params["flowIdentifier"] = "\(flowIdentifier)"
            params["flowChunkSize"] = "\(flowChunkSize)"
            params["flowTotalChunks"] = "\(flowTotalChunks)"
            params["flowTotalSize"] = "\(flowTotalSize)"
            params["flowChunkNumber"] = "\(flowChunkNumber)"
            params["flowCurrentChunkSize"] = "\(currentChunkSize)"
            params["flowFilename"] = fileUrl.lastPathComponent
            params["flowRelativePath"] = fileUrl.lastPathComponent

            let request = try! CapacitorHttpRequestBuilder()
                .setUrl(urlString)
                .setMethod(method)
                .setUrlParams(params)
                .openConnection()
                .build();


            let timeout = (connectTimeout ?? readTimeout ?? 600000.0) / 1000.0;
            let boundary = "WebKitFormBoundary\(UUID().uuidString)"

            request.setTimeout(timeout)
            request.setRequestHeaders(headers)
            request.setContentType("multipart/form-data; boundary=\(boundary)");

            body["flowIdentifier"] = "\(flowIdentifier)"
            body["flowChunkSize"] = "\(flowChunkSize)"
            body["flowTotalChunks"] = "\(flowTotalChunks)"
            body["flowTotalSize"] = "\(flowTotalSize)"
            body["flowChunkNumber"] = "\(flowChunkNumber)"
            body["flowCurrentChunkSize"] = "\(currentChunkSize)"
            body["flowFilename"] = fileUrl.lastPathComponent
            body["flowRelativePath"] = fileUrl.lastPathComponent


            let form = generateMultipartFormForChunk(chunk, fileUrl, name, boundary, body)

            var urlRequest = request.getUrlRequest();

            urlRequest.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
            urlRequest.setValue(String(form.count), forHTTPHeaderField: "Content-Length")
            urlRequest.httpBody = form
            urlRequest.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData

            let operation = UploadOperation(session: URLSession.shared, uploadTaskURL: urlRequest, completionHandler: { (data, response, error) in
                if error != nil {
                    CAPLog.print("Error on upload file", String(describing: data), String(describing: response), String(describing: error))
                    call.reject("Error", "UPLOAD", error, [:])
                    return
                }

                if (index == chunks.count - 1) {
                    let type = ResponseType(rawValue: responseType) ?? .default
                    let response = response as! HTTPURLResponse
                    let status = response.statusCode
                    let responseData: [String:Any] = self.buildResponse(data, response, responseType: type)

                    guard (200...299).contains(status) else {
                        call.reject("UPLOAD_FAILED")
                        return
                    }

                    call.resolve(responseData)

                }
             })

            queue.addOperation(operation)

        }

    }

    public static func download(_ call: CAPPluginCall) throws {
        let method = call.getString("method") ?? "GET"
        let fileDirectory = call.getString("fileDirectory") ?? "DOCUMENTS"
        let headers = (call.getObject("headers") ?? [:]) as! [String: String]
        let params = (call.getObject("params") ?? [:]) as! [String: Any]
        let connectTimeout = call.getDouble("connectTimeout");
        let readTimeout = call.getDouble("readTimeout");

        guard let urlString = call.getString("url") else { throw URLError(.badURL) }
        guard let filePath = call.getString("filePath") else { throw URLError(.badURL) }

        let request = try! CapacitorHttpRequestBuilder()
            .setUrl(urlString)
            .setMethod(method)
            .setUrlParams(params)
            .openConnection()
            .build();

        request.setRequestHeaders(headers)

        // Timeouts in iOS are in seconds. So read the value in millis and divide by 1000
        let timeout = (connectTimeout ?? readTimeout ?? 600000.0) / 1000.0;
        request.setTimeout(timeout)

        let urlRequest = request.getUrlRequest()
        let task = URLSession.shared.downloadTask(with: urlRequest) { (downloadLocation, response, error) in
            if error != nil {
                CAPLog.print("Error on download file", String(describing: downloadLocation), String(describing: response), String(describing: error))
                call.reject("Error", "DOWNLOAD", error, [:])
                return
            }

            guard let location = downloadLocation else {
                call.reject("Unable to get file after downloading")
                return
            }

            // TODO: Move to abstracted FS operations
            let fileManager = FileManager.default

            let foundDir = FilesystemUtils.getDirectory(directory: fileDirectory)
            let dir = fileManager.urls(for: foundDir, in: .userDomainMask).first

            do {
                let dest = dir!.appendingPathComponent(filePath)
                print("File Dest", dest.absoluteString)

                try FilesystemUtils.createDirectoryForFile(dest, true)

                try fileManager.moveItem(at: location, to: dest)
                call.resolve(["path": dest.absoluteString])
            } catch let e {
                call.reject("Unable to download file", "DOWNLOAD", e)
                return
            }

            CAPLog.print("Downloaded file", location)
        }

        task.resume()
    }
}

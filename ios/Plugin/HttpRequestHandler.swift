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

class HttpRequestHandler {
    private class CapacitorHttpRequestBuilder {
        private var url: URL?
        private var method: String?
        private var params: [String:String]?
        private var connectTimeout: Int?
        private var readTimeout: Int?
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
            return self;
        }
        
        public func setConnectTimeout(_ connectTimeout: Int) -> CapacitorHttpRequestBuilder {
            self.connectTimeout = connectTimeout;
            return self;
        }

        public func setReadTimeout(_ readTimeout: Int) -> CapacitorHttpRequestBuilder{
            self.readTimeout = readTimeout;
            return self;
        }

        public func setMethod(_ method: String) -> CapacitorHttpRequestBuilder {
            self.method = method;
            return self;
        }
        
        public func setUrlParams(_ params: [String:String]) -> CapacitorHttpRequestBuilder {
            if (params.count != 0) {
                var cmps = URLComponents(url: url!, resolvingAgainstBaseURL: true)
                if cmps?.queryItems == nil {
                  cmps?.queryItems = []
                }
                cmps!.queryItems?.append(contentsOf: params.map({ (key, value) -> URLQueryItem in
                  return URLQueryItem(name: key, value: value)
                }))
                url = cmps!.url!
            }
            return self;
        }
        
        
        public func openConnection() -> CapacitorHttpRequestBuilder {
            request = CapacitorUrlRequest(url!)
            return self;
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


    public static func request(_ call: CAPPluginCall) throws {
        guard let urlString = call.getString("url") else { throw URLError(.badURL) }
        guard let method = call.getString("method") else { throw URLError(.dataNotAllowed) }
        
        let headers = (call.getObject("headers") ?? [:]) as! [String: String]
        let params = (call.getObject("params") ?? [:]) as! [String: String]
        
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
        
        if isHttpMutate {
            let data = call.getObject("data") ?? [:]
            request.setRequestBody(data)
        }
        
        let urlRequest = request.getUrlRequest();
        let task = URLSession.shared.dataTask(with: urlRequest) { (data, response, error) in
            if error != nil {
                call.reject("Error", "REQUEST", error, [:])
                return;
            }

            call.resolve(HttpRequestHandler.buildResponse(data, response as! HTTPURLResponse))
        }
        
        task.resume();
    }
    
    public static func upload(_ call: CAPPluginCall) throws {
        let name = call.getString("name") ?? "file"
        let method = call.getString("method") ?? "POST"
        let fileDirectory = call.getString("fileDirectory") ?? "DOCUMENTS"
        let headers = (call.getObject("headers") ?? [:]) as! [String: String]
        let params = (call.getObject("params") ?? [:]) as! [String: String]
        let body = (call.getObject("data") ?? [:]) as [String: Any]
        
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
        
        let boundary = UUID().uuidString
        request.setContentType("multipart/form-data; boundary=\(boundary)");

        guard let form = try? generateMultipartForm(fileUrl, name, boundary, body) else { throw URLError(.cannotCreateFile) }
        
        let urlRequest = request.getUrlRequest();
        let task = URLSession.shared.uploadTask(with: urlRequest, from: form) { (data, response, error) in
            if error != nil {
                CAPLog.print("Error on upload file", data, response, error)
                call.reject("Error", "UPLOAD", error, [:])
                return
            }
            call.resolve(self.buildResponse(data, response as! HTTPURLResponse))
        }

        task.resume()
    }
    
    public static func download(_ call: CAPPluginCall) throws {
        let method = call.getString("method") ?? "GET"
        let fileDirectory = call.getString("fileDirectory") ?? "DOCUMENTS"
        let headers = (call.getObject("headers") ?? [:]) as! [String: String]
        let params = (call.getObject("params") ?? [:]) as! [String: String]
        
        guard let urlString = call.getString("url") else { throw URLError(.badURL) }
        guard let filePath = call.getString("filePath") else { throw URLError(.badURL) }

        let request = try! CapacitorHttpRequestBuilder()
            .setUrl(urlString)
            .setMethod(method)
            .setUrlParams(params)
            .openConnection()
            .build();
        
        request.setRequestHeaders(headers)

        let urlRequest = request.getUrlRequest()
        let task = URLSession.shared.downloadTask(with: urlRequest) { (downloadLocation, response, error) in
            if error != nil {
                CAPLog.print("Error on download file", downloadLocation, response, error)
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

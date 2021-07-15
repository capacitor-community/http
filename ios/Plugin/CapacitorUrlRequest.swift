import Foundation
import Capacitor

public class CapacitorUrlRequest {
    private var request: URLRequest;
    private var headers: [String:String];
    
    enum CapacitorUrlRequestError: Error {
        case serializationError(String?)
    }

    init(_ url: URL, method: String) {
        request = URLRequest(url: url)
        request.httpMethod = method
        headers = [:]
    }
    
    private func getRequestDataAsJson(_ data: JSValue) throws -> Data? {
      let jsonData = try JSONSerialization.data(withJSONObject: data)
      return jsonData
    }
    
    private func getRequestDataAsFormUrlEncoded(_ data: JSValue) throws -> Data? {
        guard var components = URLComponents(url: request.url!, resolvingAgainstBaseURL: false) else { return nil }
        components.queryItems = []
        
        guard let obj = data as? JSObject else {
            // Throw, other data types explicitly not supported
            throw CapacitorUrlRequestError.serializationError("[ data ] argument for request with content-type [ multipart/form-data ] may only be a plain javascript object")
        }
        
        obj.keys.forEach { (key: String) in
            components.queryItems?.append(URLQueryItem(name: key, value: "\(obj[key] ?? "")"))
        }
        
        
        if components.query != nil {
            return Data(components.query!.utf8)
        }

        return nil
    }
    
    private func getRequestDataAsMultipartFormData(_ data: JSValue) throws -> Data {
        guard let obj = data as? JSObject else {
            // Throw, other data types explicitly not supported.
            throw CapacitorUrlRequestError.serializationError("[ data ] argument for request with content-type [ application/x-www-form-urlencoded ] may only be a plain javascript object")
        }
        
        let strings: [String: String] = obj.compactMapValues { any in
            any as? String
        }
        
        var data = Data()
        let boundary = UUID().uuidString
        let contentType = "multipart/form-data; boundary=\(boundary)"
        request.setValue(contentType, forHTTPHeaderField: "Content-Type")
        headers["Content-Type"] = contentType
        
        strings.forEach { key, value in
            data.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
            data.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
            data.append(value.data(using: .utf8)!)
        }
        data.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        
        return data
    }
    
    private func getRequestDataAsString(_ data: JSValue) throws -> Data {
        guard let stringData = data as? String else {
            throw CapacitorUrlRequestError.serializationError("[ data ] argument could not be parsed as string")
        }
        return Data(stringData.utf8)
    }

    func getRequestHeader(_ index: String) -> Any? {
        var normalized = [:] as [String:Any]
        self.headers.keys.forEach { (key: String) in
            normalized[key.lowercased()] = self.headers[key]
        }

        return normalized[index.lowercased()]
    }
    
    func getRequestData(_ body: JSValue, _ contentType: String) throws -> Data? {
        if contentType.contains("application/json") {
            return try getRequestDataAsJson(body)
        } else if contentType.contains("application/x-www-form-urlencoded") {
            return try getRequestDataAsFormUrlEncoded(body)
        } else if contentType.contains("multipart/form-data") {
            return try getRequestDataAsMultipartFormData(body)
        } else {
            return try getRequestDataAsString(body)
        }
    }

    public func setRequestHeaders(_ headers: [String: String]) {
        headers.keys.forEach { (key: String) in
            let value = headers[key]
            request.addValue(value!, forHTTPHeaderField: key)
        }

        self.headers = headers;
    }
    
    public func setRequestBody(_ body: JSValue) throws {
        let contentType = self.getRequestHeader("Content-Type") as? String

        if contentType != nil {
            request.httpBody = try getRequestData(body, contentType!)
        }
    }

    public func setContentType(_ data: String?) {
        request.setValue(data, forHTTPHeaderField: "Content-Type")
    }

    public func setTimeout(_ timeout: TimeInterval) {
        request.timeoutInterval = timeout;
    }

    public func getUrlRequest() -> URLRequest {
        return request;
    }
}

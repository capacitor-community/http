import Foundation
import Capacitor

public class CapacitorUrlRequest {
    private var request: URLRequest;
    private var headers: [String:String];

    init(_ url: URL, method: String) {
        request = URLRequest(url: url)
        request.httpMethod = method
        headers = [:]
    }
    
    private func getRequestDataAsJson(_ data: [String: Any]) throws -> Data? {
      let jsonData = try JSONSerialization.data(withJSONObject: data)
      return jsonData
    }
    
    private func getRequestDataAsFormUrlEncoded(_ data: [String: Any]) -> Data? {
        guard var components = URLComponents(url: request.url!, resolvingAgainstBaseURL: false) else { return nil }
        components.queryItems = []
        data.keys.forEach { (key: String) in
            components.queryItems?.append(URLQueryItem(name: key, value: "\(data[key] ?? "")"))
        }

        if components.query != nil {
            return Data(components.query!.utf8)
        }

        return nil
    }
    
    private func getRequestDataAsMultipartFormData(_ data: [String: Any]) -> Data? {
        return nil
    }
    
    func getRequestHeader(_ index: String) -> Any? {
        var normalized = [:] as [String:Any]
        self.headers.keys.forEach { (key: String) in
            normalized[key.lowercased()] = self.headers[key]
        }
        
        return normalized[index.lowercased()]
    }
    
    func getRequestData(_ body: [String: Any], _ contentType: String) throws -> Data? {
        if contentType.contains("application/json") {
            return try getRequestDataAsJson(body)
        } else if contentType.contains("application/x-www-form-urlencoded") {
            return getRequestDataAsFormUrlEncoded(body)
        } else if contentType.contains("multipart/form-data") {
            return getRequestDataAsMultipartFormData(body)
        }
        return nil
    }
    
    public func setRequestHeaders(_ headers: [String: String]) {
        headers.keys.forEach { (key: String) in
            let value = headers[key]
            request.addValue(value!, forHTTPHeaderField: key)
        }
        
        self.headers = headers;
    }
    
    public func setRequestBody(_ body: [String: Any]) {
        let contentType = self.getRequestHeader("Content-Type") as? String

        if contentType != nil {
            request.httpBody = try? getRequestData(body, contentType!)
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

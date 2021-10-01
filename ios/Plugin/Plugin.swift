import Capacitor
import Foundation

@objc(HttpPlugin) public class HttpPlugin: CAPPlugin {
    var cookieManager: CapacitorCookieManager? = nil
    var capConfig: InstanceConfiguration? = nil
    
    @objc override public func load() {
        cookieManager = CapacitorCookieManager()
        capConfig = bridge?.config
    }
    
    @objc private func http(_ call: CAPPluginCall, _ httpMethod: String?) {
        // Protect against bad values from JS before calling request
        guard let _ = call.getServerURLOrReject() else { return }
        guard let _ = httpMethod ?? call.getString("method") else { return call.reject("Must provide an HTTP Method") }
    
        do {
            try HttpRequestHandler.request(call, httpMethod)
        } catch let e {
            call.reject(e.localizedDescription)
        }
    }
    
    @objc func request(_ call: CAPPluginCall) {
        http(call, nil)
    }
    
    @objc func get(_ call: CAPPluginCall) {
        http(call, "GET")
    }
    
    @objc func post(_ call: CAPPluginCall) {
        http(call, "POST")
    }
    
    @objc func put(_ call: CAPPluginCall) {
        http(call, "PUT")
    }
    
    @objc func patch(_ call: CAPPluginCall) {
        http(call, "PATCH")
    }
    
    @objc func del(_ call: CAPPluginCall) {
        http(call, "DELETE")
    }

    @objc func downloadFile(_ call: CAPPluginCall) {
        // Protect against bad values from JS before calling request
        guard let _ = call.getServerURLOrReject() else { return }
        guard let _ = call.getString("filePath") else { return call.reject("Must provide a file path to download the file to") }

        let progressEmitter: HttpRequestHandler.ProgressEmitter = {bytes, contentLength in
            self.notifyListeners("progress", data: [
                "type": "DOWNLOAD",
                "url": u,
                "bytes": bytes,
                "contentLength": contentLength
            ])
        }

        do {
            try HttpRequestHandler.download(call, updateProgress: progressEmitter)
        } catch let e {
            call.reject(e.localizedDescription)
        }
    }

    @objc func uploadFile(_ call: CAPPluginCall) {
        // Protect against bad values from JS before calling request
        guard let _ = call.getServerURLOrReject() else { return }
        guard let fp = call.getString("filePath") else { return call.reject("Must provide a file path to download the file to") }
        let fd = call.getString("fileDirectory") ?? "DOCUMENTS"
        guard let _ = FilesystemUtils.getFileUrl(fp, fd) else { return call.reject("Unable to get file URL") }
    
        do {
            try HttpRequestHandler.upload(call)
        } catch let e {
            call.reject(e.localizedDescription)
        }
    }

    @objc func setCookie(_ call: CAPPluginCall) {
        guard let url = call.getServerURLOrReject() else { return }
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        guard let value = call.getString("value") else { return call.reject("Must provide value") }
    
        cookieManager!.setCookie(url, key, cookieManager!.encode(value))
        call.resolve()
    }

    @objc func getCookies(_ call: CAPPluginCall) {
        guard let url = call.getServerURLOrReject() else { return }
  
        let cookies = cookieManager!.getCookies(url)
        let output = cookies.map { (cookie: HTTPCookie) -> [String: String] in
            return [
                "key": cookie.name,
                "value": cookie.value,
            ]
        }
        call.resolve([
            "cookies": output
        ])
    }
    
    @objc func getCookie(_ call: CAPPluginCall) {
        guard let url = call.getServerURLOrReject() else { return }
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        
        let cookie = cookieManager!.getCookie(url, key)
        call.resolve([
            "key": cookie.name,
            "value": cookieManager!.decode(cookie.value)
        ])
    }

    @objc func deleteCookie(_ call: CAPPluginCall) {
        guard let url = call.getServerURLOrReject() else { return }
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        
        let jar = HTTPCookieStorage.shared
        jar.cookies(for: url)?
            .filter { $0.name == key }
            .forEach { jar.deleteCookie($0) }
        
        call.resolve()
    }

    @objc func clearCookies(_ call: CAPPluginCall) {
        guard let url = call.getServerURLOrReject() else { return }
        
        let jar = HTTPCookieStorage.shared
        jar.cookies(for: url)?
            .forEach { jar.deleteCookie($0) }
        
        call.resolve()
    }
}

private extension CAPPluginCall {
    func getServerURLOrReject() -> URL? {
        return getURLOrReject("url")
    }
    
    func getURLOrReject(_ key: String) -> URL? {
        guard let urlString = getString(key) else {
            reject("Invalid URL. Check that \(key) is passed in correctly")
            return nil
        }
        guard let url = URL(string: urlString) else {
            reject("Could not parse URL. Check that \(key) has valid format")
            return nil
        }
        return url
    }
}

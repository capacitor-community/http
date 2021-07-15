import Capacitor
import Foundation

@objc(HttpPlugin) public class HttpPlugin: CAPPlugin {
    var cookieManager: CapacitorCookieManager? = nil
    var capConfig: InstanceConfiguration? = nil
    
    private func getServerUrl(_ call: CAPPluginCall) -> URL? {
        guard let urlString = call.getString("url") else {
            call.reject("Invalid URL. Check that \"url\" is passed in correctly")
            return nil
        }
        
        let url = URL(string: urlString)
        return url;
    }
    
    @objc override public func load() {
        cookieManager = CapacitorCookieManager()
        capConfig = bridge?.config
    }
    
    @objc func http(_ call: CAPPluginCall, _ httpMethod: String?) {
        // Protect against bad values from JS before calling request
        guard let u = call.getString("url") else { return call.reject("Must provide a URL"); }
        guard let _ = httpMethod ?? call.getString("method") else { return call.reject("Must provide an HTTP Method"); }
        guard var _ = URL(string: u) else { return call.reject("Invalid URL"); }
    
        do {
            try HttpRequestHandler.request(call)
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
        guard let u = call.getString("url") else { return call.reject("Must provide a URL") }
        guard let _ = call.getString("filePath") else { return call.reject("Must provide a file path to download the file to") }
        guard let _ = URL(string: u) else { return call.reject("Invalid URL") }

        do {
            try HttpRequestHandler.download(call)
        } catch let e {
            call.reject(e.localizedDescription)
        }
    }

    @objc func uploadFile(_ call: CAPPluginCall) {
        // Protect against bad values from JS before calling request
        let fd = call.getString("fileDirectory") ?? "DOCUMENTS"
        guard let u = call.getString("url") else { return call.reject("Must provide a URL") }
        guard let fp = call.getString("filePath") else { return call.reject("Must provide a file path to download the file to") }
        guard let _ = URL(string: u) else { return call.reject("Invalid URL") }
        guard let _ = FilesystemUtils.getFileUrl(fp, fd) else { return call.reject("Unable to get file URL") }
    
        do {
            try HttpRequestHandler.upload(call)
        } catch let e {
            call.reject(e.localizedDescription)
        }
    }

    @objc func setCookie(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        guard let value = call.getString("value") else { return call.reject("Must provide value") }
    
        let url = getServerUrl(call)
        if url != nil {
            cookieManager!.setCookie(url!, key, cookieManager!.encode(value))
            call.resolve()
        }
    }

    @objc func getCookies(_ call: CAPPluginCall) {
        let url = getServerUrl(call)
        if url != nil {
            let cookies = cookieManager!.getCookies(url!)
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
    }
    
    @objc func getCookie(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        let url = getServerUrl(call)
        if url != nil {
            let cookie = cookieManager!.getCookie(url!, key)
            call.resolve([
                "key": cookie.name,
                "value": cookieManager!.decode(cookie.value)
            ])
        }
    }

    @objc func deleteCookie(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        let url = getServerUrl(call)
        if url != nil {
            let jar = HTTPCookieStorage.shared

            let cookie = jar.cookies(for: url!)?.first(where: { (cookie) -> Bool in
                return cookie.name == key
            })

            if cookie != nil {
                jar.deleteCookie(cookie!)
            }

            call.resolve()
        }
    }

    @objc func clearCookies(_ call: CAPPluginCall) {
        let url = getServerUrl(call)
        if url != nil {
            let jar = HTTPCookieStorage.shared
            jar.cookies(for: url!)?.forEach({ (cookie) in jar.deleteCookie(cookie) })
            call.resolve()
        }
    }
}

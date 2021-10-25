import Foundation
import Capacitor

public class CapacitorCookieManager {
    private let jar = HTTPCookieStorage.shared
    
    public func encode(_ value: String) -> String {
        return value.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed)!
    }
    
    public func decode(_ value: String) -> String {
        return value.removingPercentEncoding!
    }
    
    public func setCookie(_ url: URL, _ key: String, _ value: String) {
        let field = ["Set-Cookie": "\(key)=\(value)"]
        let cookies = HTTPCookie.cookies(withResponseHeaderFields: field, for: url)
        jar.setCookies(cookies, for: url, mainDocumentURL: url)
    }
    
    public func getCookie(_ url: URL, _ key: String) -> HTTPCookie {
        let cookie = getCookies(url)
            .first { $0.name == key }
        
        return cookie ?? HTTPCookie()
    }
    
    public func getCookies(_ url: URL) -> [HTTPCookie] {
        return jar.cookies(for: url) ?? []
    }
    
    public func deleteCookie(_ url: URL, _ key: String) {
        let cookie = jar.cookies(for: url)?.first(where: { (cookie) -> Bool in
          return cookie.name == key
        })

        if cookie != nil { jar.deleteCookie(cookie!) }
    }
    
    public func clearCookies(_ url: URL?) {
        if let url = url {
            jar.cookies(for: url)?.forEach({ (cookie) in jar.deleteCookie(cookie) })
        } else {
            let cookies = HTTPCookieStorage.shared.cookies
            cookies?.forEach { HTTPCookieStorage.shared.deleteCookie($0) }
        }
    }
}

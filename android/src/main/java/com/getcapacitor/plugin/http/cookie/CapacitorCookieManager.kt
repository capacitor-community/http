package com.getcapacitor.plugin.http.cookie

import android.content.Context
import android.util.Log
import net.gotev.cookiestore.SharedPreferencesCookieStore
import net.gotev.cookiestore.WebKitSyncCookieManager
import net.gotev.cookiestore.okhttp.JavaNetCookieJar
import net.gotev.cookiestore.syncToWebKitCookieManager
import okhttp3.CookieJar
import java.net.CookiePolicy
import java.net.HttpCookie
import java.net.URI

class CapacitorCookieManager(context: Context) {

    private val cookieStore: SharedPreferencesCookieStore = SharedPreferencesCookieStore(context, "CapCommunityHttpCookies")
    private val cookieManager = WebKitSyncCookieManager(
        store = cookieStore,
        cookiePolicy = CookiePolicy.ACCEPT_ALL,
        onWebKitCookieManagerError = { exception ->
            // This gets invoked when there's internal webkit cookie manager exceptions
            Log.e("COOKIE-STORE", "WebKitSyncCookieManager error", exception)
        }
    )

    fun getCookieJar(): CookieJar {
        return JavaNetCookieJar(cookieManager)
    }

    fun getCookies(): List<HttpCookie> {
        cookieManager.cookieStore.syncToWebKitCookieManager()
        return cookieManager.cookieStore.cookies
    }

    fun getCookie(key: String): HttpCookie? {
        return cookieManager.cookieStore.cookies.find { it.name == key }
    }

    fun setCookie(url: URI, name: String, value: String) {
        val cookie = HttpCookie(name, value)
        cookieManager.cookieStore.add(url, cookie)
    }

    fun deleteAllCookies() {
        cookieManager.cookieStore.removeAll()
    }

    fun deleteCookie(url: URI, key: String) {
        val cookie = getCookie(key)
        if (cookie != null) {
            cookieManager.cookieStore.remove(url, cookie)
        }
    }
}

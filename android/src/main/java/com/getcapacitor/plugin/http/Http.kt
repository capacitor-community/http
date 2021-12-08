package com.getcapacitor.plugin.http

import android.Manifest
import android.util.Log
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.plugin.http.CapacitorHttpHandler.download
import com.getcapacitor.plugin.http.CapacitorHttpHandler.request
import com.getcapacitor.plugin.http.CapacitorHttpHandler.upload
import com.getcapacitor.plugin.http.FileExtensions.isPublicDirectory
import com.getcapacitor.plugin.http.cookie.CapacitorCookieManager
import java.lang.Exception
import java.net.URI

/**
 * Native HTTP Plugin
 */
@CapacitorPlugin(
    name = "Http",
    permissions = [
        Permission(strings = [Manifest.permission.WRITE_EXTERNAL_STORAGE], alias = "HttpWrite"),
        Permission(strings = [Manifest.permission.WRITE_EXTERNAL_STORAGE], alias = "HttpRead")
    ]
)
class Http : Plugin() {
    private lateinit var capConfig: CapConfig
    private lateinit var cookieManager: CapacitorCookieManager

    override fun load() {
        capConfig = getBridge().config
        cookieManager = CapacitorCookieManager(context)
    }

    /**
     * Helper function for getting the serverUrl from the Capacitor Config. Returns an empty
     * string if it is invalid and will auto-reject through `call`
     * @param call the `PluginCall` context
     * @return the string of the server specified in the Capacitor config
     */
    private fun getServerUrl(call: PluginCall): URI? {
        val url = call.getString("url", "http://localhost")
        return getUri(url)
    }

    /**
     * Try to parse a url string and if it can't be parsed, return null
     * @param url the url string to try to parse
     * @return a parsed URI
     */
    private fun getUri(url: String?): URI? {
        return try { URI(url) } catch (ex: Exception) { null }
    }

    private fun isStoragePermissionGranted(call: PluginCall, permission: String): Boolean {
        return if (hasPermission(permission)) {
            Log.v(logTag, "Permission '$permission' is granted")
            true
        } else {
            Log.v(logTag, "Permission '$permission' denied. Asking user for it.")
            requestPermissions(call)
            false
        }
    }

    private fun http(call: PluginCall, httpMethod: String) {
        val asyncHttpCall = Runnable {
            try {
                val response = request(call, httpMethod, cookieManager)
                call.resolve(response)
            } catch (e: Exception) {
                println(e.toString())
                call.reject(e.javaClass.simpleName, e)
            }
        }
        val httpThread = Thread(asyncHttpCall)
        httpThread.start()
    }

    @PluginMethod
    fun request(call: PluginCall) {
        val method = call.getString("method") ?: return call.reject("When using the \"request\" function, a \"method\" parameter is required.")
        http(call, method)
    }

    @PluginMethod
    fun get(call: PluginCall) {
        http(call, "GET")
    }

    @PluginMethod
    fun post(call: PluginCall) {
        http(call, "POST")
    }

    @PluginMethod
    fun put(call: PluginCall) {
        http(call, "PUT")
    }

    @PluginMethod
    fun patch(call: PluginCall) {
        http(call, "PATCH")
    }

    @PluginMethod
    fun del(call: PluginCall) {
        http(call, "DELETE")
    }

    @PluginMethod
    fun downloadFile(call: PluginCall) {
        try {
            bridge.saveCall(call)
            val fileDirectory = call.getString("fileDirectory", FileExtensions.DIRECTORY_DOCUMENTS)
            if (!isPublicDirectory(fileDirectory!!) ||
                    isStoragePermissionGranted(call, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
                call.release(bridge)
                var callback: IProgressCallback? = object : IProgressCallback {
                    override fun onProgress(progress: Double) {

                    }
                }
                val isProgressTracked = call.getBoolean("progress", false)
                if (isProgressTracked!!) {
                    callback = object : IProgressCallback {
                        override fun onProgress(progress: Double) {
                            val ret = JSObject()
                            ret.put("type", "DOWNLOAD")
                            ret.put("url", call.getString("url"))
                            ret.put("bytes", progress)
                            notifyListeners("progress", ret)
                        }
                    }
                }
                val response = download(call, context, cookieManager, callback!!)
                call.resolve(response)
            }
        } catch (ex: Exception) {
            call.reject("Error", ex)
        }
    }

    @PluginMethod
    fun uploadFile(call: PluginCall) {
        try {
            val fileDirectory = call.getString("fileDirectory", FileExtensions.DIRECTORY_DOCUMENTS)
            bridge.saveCall(call)
            if (!isPublicDirectory(fileDirectory!!) ||
                    isStoragePermissionGranted(call, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
                call.release(bridge)
                val response = upload(call, context, cookieManager)
                call.resolve(response)
            }
        } catch (ex: Exception) {
            call.reject("Error", ex)
        }
    }

    @PluginMethod
    fun setCookie(call: PluginCall) {
        val key = call.getString("key") ?: return call.reject("\"key\" must not be null")
        val value = call.getString("value") ?: return call.reject("\"value\" must not be null")
        val url = getServerUrl(call) ?: return call.reject("Could not parse the server \"url\" value")

        cookieManager.setCookie(url, key, value)
        call.resolve()
    }

    @PluginMethod
    fun getCookiesMap(call: PluginCall) {
        val cookies = cookieManager.getCookies()
        val cookiesJsObject = JSObject()
        for (cookie in cookies) {
            cookiesJsObject.put(cookie.name, cookie.value)
        }
        call.resolve(cookiesJsObject)
    }

    @PluginMethod
    fun getCookies(call: PluginCall) {
        val cookies = cookieManager.getCookies()
        val cookiesJsArray = JSArray()
        for (cookie in cookies) {
            val cookieJsPair = JSObject()
            cookieJsPair.put("key", cookie.name)
            cookieJsPair.put("value", cookie.value)
            cookiesJsArray.put(cookieJsPair)
        }
        val cookiesJsObject = JSObject()
        cookiesJsObject.put("cookies", cookiesJsArray)
        call.resolve(cookiesJsObject)
    }

    @PluginMethod
    fun getCookie(call: PluginCall) {
        val key = call.getString("key") ?: return call.reject("\"key\" must not be null")
        val cookie = cookieManager.getCookie(key)
        val cookieJsObject = JSObject()
        cookieJsObject.put("key", key)
        if (cookie != null) {
            cookieJsObject.put("value", cookie.value)
        } else {
            cookieJsObject.put("value", "")
        }
        call.resolve(cookieJsObject)
    }

    @PluginMethod
    fun deleteCookie(call: PluginCall) {
        val key = call.getString("key") ?: return call.reject("\"key\" must not be null")
        val url = getServerUrl(call) ?: return call.reject("Could not parse the server \"url\" value")

        cookieManager.deleteCookie(url, key)
        call.resolve()
    }

    @PluginMethod
    fun clearCookies(call: PluginCall) {
        cookieManager.deleteAllCookies()
        call.resolve()
    }
}
package com.getcapacitor.plugin.http

import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall
import com.getcapacitor.plugin.http.parser.Parser
import okhttp3.*
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.Locale
import java.util.concurrent.TimeUnit

object CapacitorHttpHandler {
    @JvmStatic
    fun request(call: PluginCall, httpMethod: String?): JSObject {
        // Parse variables
        val url = call.getString("url", "")!!
        val headersJSObject = call.getObject("headers")
        val connectTimeout = call.getInt("connectTimeout", 10000)!!.toLong()
        val readTimeout = call.getInt("readTimeout", 10000)!!.toLong()
        val writeTimeout = call.getInt("writeTimeout", 10000)!!.toLong()
        val disableRedirects = call.getBoolean("disableRedirects", false)!!
        val method = httpMethod?.uppercase(Locale.getDefault()) ?: call.getString("method", "")!!.uppercase(Locale.getDefault())

        // Generate HttpClient
        val client = OkHttpClient()
                .newBuilder()
                .connectTimeout(connectTimeout, TimeUnit.MILLISECONDS)
                .readTimeout(readTimeout, TimeUnit.MILLISECONDS)
                .writeTimeout(writeTimeout, TimeUnit.MILLISECONDS)
                .followRedirects(!disableRedirects)
                .followSslRedirects(true)
                .build()

        // Create Body
        var data: RequestBody? = call.getObject("data").toString().toRequestBody()
        if (method == "GET" || method == "HEAD") {
            data = null // OkHttp doesn't allow body in GET or HEAD requests, so nullify body to prevent error
        }

        // Create Headers
        val headersBuilder = Headers.Builder()
        val keys: Iterator<String> = headersJSObject.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            val value = headersJSObject.getString(key)
            if (value != null) {
                headersBuilder.add(key, value)
            }
        }
        val headers = headersBuilder.build()

        // Create Request
        val request = Request.Builder()
                .url(url)
                .headers(headers)
                .method(method, data)
                .build()

        // Execute request and return value
        client.newCall(request).execute().use { response ->
            val output = JSObject()
            output.put("statusCode", response.code)
            output.put("statusMessage", response.message)
            output.put("url", response.request.url.toString())
            output.put("error", !response.isSuccessful)
            output.put("headers", parseResponseHeaders(response))
            output.put("data", parseResponseBody(response))
            return output
        }
    }

    private fun parseResponseHeaders(res: Response): JSObject {
        val output = JSObject()
        res.headers.toMultimap().forEach { (key, value) ->
            output.put(key, value.joinToString("; "))
        }
        return output
    }

    private fun parseResponseBody(res: Response): Any? {
        val body = res.body ?: return null

        val responseContentType = body.contentType()
        val contentType = responseContentType?.let { ContentType.parse("${it.type}/${it.subtype}") } ?: ContentType.UNKNOWN
        val bytes = body.byteStream()

        // Use response content-type to parse output
        when(contentType) {
            ContentType.APPLICATION_OCTET_STREAM -> return Parser.parseByteStream(bytes)
            ContentType.APPLICATION_OGG -> TODO()
            ContentType.APPLICATION_PDF -> TODO()
            ContentType.APPLICATION_XHTML_XML -> return Parser.parseByteStream(bytes)
            ContentType.APPLICATION_JSON -> return Parser.parseJson(bytes).value
            ContentType.APPLICATION_LD_JSON -> return Parser.parseJson(bytes).value
            ContentType.APPLICATION_VND_API_JSON -> return Parser.parseJson(bytes).value
            ContentType.APPLICATION_XML -> return Parser.parseByteStream(bytes)
            ContentType.APPLICATION_ZIP -> TODO()
            ContentType.APPLICATION_X_WWW_FORM_URLENCODED -> TODO()
            ContentType.AUDIO_MPEG -> TODO()
            ContentType.AUDIO_X_MS_WMA -> TODO()
            ContentType.AUDIO_VND_RN_REALAUDIO -> TODO()
            ContentType.AUDIO_X_WAV -> TODO()
            ContentType.IMAGE_GIF -> return "data:image/gif;base64,${Parser.parseByteStreamBase64(bytes)}"
            ContentType.IMAGE_JPEG -> return "data:image/jpg;base64,${Parser.parseByteStreamBase64(bytes)}"
            ContentType.IMAGE_PNG -> return "data:image/png;base64,${Parser.parseByteStreamBase64(bytes)}"
            ContentType.IMAGE_TIFF -> return "data:image/tiff;base64,${Parser.parseByteStreamBase64(bytes)}"
            ContentType.IMAGE_X_ICON -> return Parser.parseByteStream(bytes)
            ContentType.IMAGE_SVG_XML -> return Parser.parseByteStream(bytes)
            ContentType.MULTIPART_MIXED -> TODO()
            ContentType.MULTIPART_ALTERNATIVE -> TODO()
            ContentType.MULTIPART_FORM_DATA -> TODO()
            ContentType.TEXT_CSS -> return Parser.parseByteStream(bytes)
            ContentType.TEXT_CSV -> return Parser.parseByteStream(bytes)
            ContentType.TEXT_HTML -> return Parser.parseByteStream(bytes)
            ContentType.TEXT_PLAIN -> return Parser.parseByteStream(bytes)
            ContentType.TEXT_XML -> return Parser.parseByteStream(bytes)
            ContentType.VIDEO_MPEG -> TODO()
            ContentType.VIDEO_MP4 -> TODO()
            ContentType.VIDEO_QUICKTIME -> TODO()
            ContentType.VIDEO_X_MS_WMV -> TODO()
            ContentType.VIDEO_X_FLV -> TODO()
            ContentType.VIDEO_WEBM -> TODO()
            ContentType.UNKNOWN -> return Parser.parseByteStream(bytes)
        }
    }
}
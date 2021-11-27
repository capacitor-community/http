package com.getcapacitor.plugin.http.parser

import android.util.Base64
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import org.json.JSONException
import java.io.ByteArrayOutputStream
import java.io.InputStream

/**
 * Static Object with helper functions for parsing data
 */
object Parser {
    /**
     * Parses a string into a JSON value
     * @param input The input string to parse into a JSON value
     */
    fun parseJson(input: String): JSValue {
        if ("null" == input.trim { it <= ' ' }) return JSValue(null)
        if ("true" == input.trim { it <= ' ' }) return JSValue(true)
        if ("false" == input.trim { it <= ' ' }) return JSValue(false)

        return try {
            JSValue(JSObject(input))
        } catch (e: JSONException) {
            JSValue(JSArray(input))
        }
    }

    /**
     * Parses an input string into a JSON value
     * @param stream The input stream to parse into a JSON value
     */
    fun parseJson(stream: InputStream): JSValue {
        val string = parseByteStream(stream)
        return parseJson(string)
    }

    /**
     * Parses a ByteArray stream into a String
     */
    fun parseByteStream(stream: InputStream): String {
        ByteArrayOutputStream().use { out ->
            val buffer = ByteArray(1024)
            var readBytes: Int
            while (stream.read(buffer).also { readBytes = it } != -1) {
                out.write(buffer, 0, readBytes)
            }
            val bytes = out.toByteArray()
            return String(bytes, Charsets.UTF_8)
        }
    }

    /**
     * Parses a ByteArray stream into a ByteArray
     */
    fun parseByteStreamBase64(stream: InputStream): String {
        ByteArrayOutputStream().use { out ->
            val buffer = ByteArray(1024)
            var readBytes: Int
            while (stream.read(buffer).also { readBytes = it } != -1) {
                out.write(buffer, 0, readBytes)
            }
            val bytes = out.toByteArray()
            return Base64.encodeToString(bytes, Base64.DEFAULT)
        }
    }
}
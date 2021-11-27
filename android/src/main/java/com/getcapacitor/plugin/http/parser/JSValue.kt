package com.getcapacitor.plugin.http.parser

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import org.json.JSONException

/**
 * Simple wrapper for JSObject, JSArray, Boolean, and NULL values
 */
class JSValue(val value: Any?) {
    private val ERROR_MESSAGE = "Provided value is not a JSON safe value. Safe values include a valid JSObject, JSArray, Boolean or \"null\" value."

    init {
        // Validate the passed in value is valid
        if (value !is JSObject && value !is JSArray && value !is Boolean && value != null) {
            throw JSONException(ERROR_MESSAGE)
        }
    }

    override fun toString(): String {
        return value.toString()
    }
}
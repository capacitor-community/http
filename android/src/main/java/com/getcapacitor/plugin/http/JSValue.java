package com.getcapacitor.plugin.http;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import org.json.JSONException;

/**
 * Represents a single user-data value of any type on the capacitor PluginCall object.
 */
public class JSValue {

    private final Object value;

    /**
     * @param call The capacitor plugin call, used for accessing the value safely.
     * @param names The names of the property to access.
     */
    public JSValue(PluginCall call, String... names) {
        this.value = this.toValue(call, names);
    }

    /**
     * Returns the coerced but uncasted underlying value.
     */
    public Object getValue() {
        return this.value;
    }

    @Override
    public String toString() {
        return this.getValue().toString();
    }

    /**
     * Returns the underlying value as a JSObject, or throwing if it cannot.
     *
     * @throws JSONException If the underlying value is not a JSObject.
     */
    public JSObject toJSObject() throws JSONException {
        if (this.value instanceof JSObject) return (JSObject) this.value;
        throw new JSONException("JSValue could not be coerced to JSObject.");
    }

    /**
     * Returns the underlying value as a JSArray, or throwing if it cannot.
     *
     * @throws JSONException If the underlying value is not a JSArray.
     */
    public JSArray toJSArray() throws JSONException {
        if (this.value instanceof JSArray) return (JSArray) this.value;
        throw new JSONException("JSValue could not be coerced to JSArray.");
    }

    /**
     * Returns the underlying value this object represents, coercing it into a capacitor-friendly object if supported.
     */
    private Object toValue(PluginCall call, String... names) {
        Object retValue = null;
        for (String name : names) {
            Object value;
            value = call.getArray(name, null);
            if (value != null) return value;
            retValue = retValue == null ? call.getObject(name, null) : ((JSObject)retValue).opt(name);
            if (retValue != null) continue;
            value = call.getString(name, null);
            if (value != null) return value;
            value = call.getData().opt(name);
            if (value != null) return value;
        }
        return retValue;
    }
}

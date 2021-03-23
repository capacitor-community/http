package com.getcapacitor.plugin.http;

import com.getcapacitor.JSObject;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import static com.getcapacitor.plugin.http.HttpRequestHandler.ResponseType.JSON;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertEquals;

public class HttpRequestHandlerTest {

    @Test
    public void readData_error_with_HTML_message() throws IOException, JSONException {
        String result = (String) HttpRequestHandler.readData(
                errorWithHtmlMessage("html-error"),
                JSON);

        assertEquals("html-error\n", result);
    }

    @Test
    public void readData_error_with_JSON() throws IOException, JSONException {
        JSObject jsonObject = new JSObject("{ 'message' : 'Hello world!' }");

        JSObject result = (JSObject) HttpRequestHandler.readData(
                errorWithJson(jsonObject),
                JSON);

        assertEquals(jsonObject.toString(), result.toString());
    }

    @Test
    public void readData_success_with_JSON() throws IOException, JSONException {
        JSObject jsonObject = new JSObject("{ 'message' : 'Hello world!' }");

        JSObject result = (JSObject) HttpRequestHandler.readData(
                successWithJson(jsonObject),
                JSON);

        assertEquals(jsonObject.toString(), result.toString());
    }

    @SuppressWarnings("SameParameterValue")
    private static CapacitorHttpUrlResponseMock errorWithHtmlMessage(String htmlErrorMessage) {
        return new CapacitorHttpUrlResponseMock(
                null,
                new ByteArrayInputStream(htmlErrorMessage.getBytes(UTF_8)),
                MimeType.TEXT_HTML.getValue());
    }

    private static CapacitorHttpUrlResponseMock errorWithJson(JSONObject jsonObject) {
        return new CapacitorHttpUrlResponseMock(
                null,
                new ByteArrayInputStream(jsonObject.toString().getBytes(UTF_8)),
                MimeType.APPLICATION_VND_API_JSON.getValue());
    }

    private static CapacitorHttpUrlResponseMock successWithJson(JSONObject jsonObject) {
        return new CapacitorHttpUrlResponseMock(
                new ByteArrayInputStream(jsonObject.toString().getBytes(UTF_8)),
                null,
                null);
    }

    private static class CapacitorHttpUrlResponseMock implements ICapacitorHttpUrlConnection {
        private final InputStream inputStream;
        private final InputStream errorStream;
        private final Map<String, String> headerFields = new HashMap<>();

        CapacitorHttpUrlResponseMock(InputStream inputStream, InputStream errorStream, String contentType) {
            this.inputStream = inputStream;
            this.errorStream = errorStream;
            if (contentType != null) {
                this.headerFields.put("Content-Type", contentType);
            }
        }

        @Override
        public InputStream getInputStream() {
            return inputStream;
        }

        @Override
        public InputStream getErrorStream() {
            return errorStream;
        }

        @Override
        public String getHeaderField(String name) {
            return headerFields.get(name);
        }
    }
}

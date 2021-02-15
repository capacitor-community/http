package com.getcapacitor.plugin.http;

import android.Manifest;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.CapConfig;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpCookie;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Native HTTP Plugin
 */
@CapacitorPlugin(
    name = "Http",
    permissions = {
        @Permission(strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "HttpWrite"),
        @Permission(strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "HttpRead"),
    }
)
public class Http extends Plugin {
    public static final int HTTP_REQUEST_DOWNLOAD_WRITE_PERMISSIONS = 9022;
    public static final int HTTP_REQUEST_UPLOAD_READ_PERMISSIONS = 9023;

    CapConfig capConfig;
    CapacitorCookieManager cookieManager;

    /**
     * Helper function for getting the serverUrl from the Capacitor Config. Returns an empty
     * string if it is invalid and will auto-reject through {@code call}
     * @param call the {@code PluginCall} context
     * @return the string of the server specified in the Capacitor config
     */
    private String getServerUrl(PluginCall call) {
        String url = capConfig.getServerUrl();

        URI uri = getUri(url);
        if (uri == null) {
            call.reject("Invalid URL. Check that \"server\" is set correctly in your capacitor.config.json file");
            return "";
        }

        return url;
    }

    /**
     * See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
     */
    private enum ResponseType {
        ARRAY_BUFFER("arraybuffer"),
        BLOB("blob"),
        DOCUMENT("document"),
        JSON("json"),
        TEXT("text");

        private final String name;

        ResponseType(String name) {
            this.name = name;
        }

        static final ResponseType DEFAULT = TEXT;

        static ResponseType parse(String value) {
            for (ResponseType responseType: values()) {
                if (responseType.name.equalsIgnoreCase(value)) {
                    return responseType;
                }
            }
            return DEFAULT;
        }
    }

    @Override
    public void load() {
        this.cookieManager = new CapacitorCookieManager(null, java.net.CookiePolicy.ACCEPT_ALL);
        java.net.CookieHandler.setDefault(cookieManager);
        capConfig = getBridge().getConfig();
    }

    @PluginMethod()
    public void request(final PluginCall call) {
        new Thread(
            new Runnable() {
                public void run() {
                    String url = call.getString("url");
                    String method = call.getString("method");
                    JSObject headers = call.getObject("headers");
                    JSObject params = call.getObject("params");

                    switch (method) {
                        case "GET":
                        case "HEAD":
                            get(call, url, method, headers, params);
                            break;
                        case "DELETE":
                        case "PATCH":
                        case "POST":
                        case "PUT":
                            mutate(call, url, method, headers);
                    }
                }
            }
        ).start();
    }

    private void get(PluginCall call, String urlString, String method, JSObject headers, JSObject params) {
        try {
            Integer connectTimeout = call.getInt("connectTimeout");
            Integer readTimeout = call.getInt("readTimeout");
            ResponseType responseType = ResponseType.parse(call.getString("responseType"));

            URL url = new URL(urlString);
            HttpURLConnection conn = makeUrlConnection(url, method, connectTimeout, readTimeout, headers, params);

            buildResponse(call, conn, responseType);
        } catch (MalformedURLException ex) {
            call.reject("Invalid URL", ex);
        } catch (IOException ex) {
            call.reject("IO Error", ex);
        } catch (Exception ex) {
            call.reject("Error", ex);
        }
    }

    private void mutate(PluginCall call, String urlString, String method, JSObject headers) {
        try {
            Integer connectTimeout = call.getInt("connectTimeout");
            Integer readTimeout = call.getInt("readTimeout");
            JSObject data = call.getObject("data");

            URL url = new URL(urlString);

            HttpURLConnection conn = makeUrlConnection(url, method, connectTimeout, readTimeout, headers, null);

            conn.setDoOutput(true);

            setRequestBody(conn, data, headers);

            conn.connect();

            buildResponse(call, conn);
        } catch (MalformedURLException ex) {
            call.reject("Invalid URL", ex);
        } catch (IOException ex) {
            call.reject("IO Error", ex);
        } catch (Exception ex) {
            call.reject("Error", ex);
        }
    }

    private HttpURLConnection makeUrlConnection(
        URL url,
        String method,
        Integer connectTimeout,
        Integer readTimeout,
        JSObject headers,
        JSObject params
    ) throws Exception {
        if (params != null) {
            url = setParams(url, params);
        }

        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setAllowUserInteraction(false);
        conn.setRequestMethod(method);

        if (connectTimeout != null) {
            conn.setConnectTimeout(connectTimeout);
        }

        if (readTimeout != null) {
            conn.setReadTimeout(readTimeout);
        }

        setRequestHeaders(conn, headers);

        return conn;
    }

    @PluginMethod()
    public void downloadFile(PluginCall call) {
        try {
            bridge.saveCall(call);
            String urlString = call.getString("url");
            String filePath = call.getString("filePath");
            String fileDirectory = call.getString("fileDirectory", FilesystemUtils.DIRECTORY_DOCUMENTS);
            JSObject headers = call.getObject("headers");
            JSObject params = call.getObject("params");

            Integer connectTimeout = call.getInt("connectTimeout");
            Integer readTimeout = call.getInt("readTimeout");

            URL url = new URL(urlString);

            if (
                !FilesystemUtils.isPublicDirectory(fileDirectory) ||
                isStoragePermissionGranted(call, Manifest.permission.WRITE_EXTERNAL_STORAGE)
            ) {
                call.release(bridge);

                final File file = FilesystemUtils.getFileObject(getContext(), filePath, fileDirectory);

                HttpURLConnection conn = makeUrlConnection(url, "GET", connectTimeout, readTimeout, headers, params);

                InputStream is = conn.getInputStream();

                FileOutputStream fos = new FileOutputStream(file, false);

                byte[] buffer = new byte[1024];
                int len;

                while ((len = is.read(buffer)) > 0) {
                    fos.write(buffer, 0, len);
                }

                is.close();
                fos.close();

                call.resolve(
                    new JSObject() {
                        {
                            put("path", file.getAbsolutePath());
                        }
                    }
                );
            }
        } catch (MalformedURLException ex) {
            call.reject("Invalid URL", ex);
        } catch (IOException ex) {
            call.reject("IO Error", ex);
        } catch (Exception ex) {
            call.reject("Error", ex);
        }
    }

    private boolean isStoragePermissionGranted(PluginCall call, String permission) {
        if (hasPermission(permission)) {
            Log.v(getLogTag(), "Permission '" + permission + "' is granted");
            return true;
        } else {
            Log.v(getLogTag(), "Permission '" + permission + "' denied. Asking user for it.");
            requestPermissions(call);
            return false;
        }
    }

    @PluginMethod()
    public void uploadFile(PluginCall call) {
        String urlString = call.getString("url");
        String filePath = call.getString("filePath");
        String fileDirectory = call.getString("fileDirectory", FilesystemUtils.DIRECTORY_DOCUMENTS);
        String name = call.getString("name", "file");
        Integer connectTimeout = call.getInt("connectTimeout");
        Integer readTimeout = call.getInt("readTimeout");
        JSObject headers = call.getObject("headers");
        JSObject params = call.getObject("params");
        JSObject data = call.getObject("data");

        try {
            bridge.saveCall(call);
            URL url = new URL(urlString);

            if (
                !FilesystemUtils.isPublicDirectory(fileDirectory) ||
                isStoragePermissionGranted(call, Manifest.permission.WRITE_EXTERNAL_STORAGE)
            ) {
                call.release(bridge);
                File file = FilesystemUtils.getFileObject(getContext(), filePath, fileDirectory);

                HttpURLConnection conn = makeUrlConnection(url, "POST", connectTimeout, readTimeout, headers, null);
                conn.setDoOutput(true);

                FormUploader builder = new FormUploader(conn);
                builder.addFilePart(name, file, data);
                builder.finish();

                buildResponse(call, conn);
            }
        } catch (Exception ex) {
            call.reject("Error", ex);
        }
    }

    @PluginMethod()
    public void setCookie(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");
        String url = getServerUrl(call);

        if (!url.isEmpty()) {
            cookieManager.setCookie(url, key, value);
            call.resolve();
        }
    }

    @PluginMethod()
    public void getCookiesMap(PluginCall call) {
        String url = getServerUrl(call);
        if (!url.isEmpty()) {
            HttpCookie[] cookies = cookieManager.getCookies(url);
            JSObject cookiesJsObject = new JSObject();
            for (HttpCookie cookie : cookies) {
                cookiesJsObject.put(cookie.getName(), cookie.getValue());
            }
            call.resolve(cookiesJsObject);
        }
    }


    @PluginMethod()
    public void getCookies(PluginCall call) {
        String url = getServerUrl(call);
        if (!url.isEmpty()) {
            HttpCookie[] cookies = cookieManager.getCookies(url);
            JSArray cookiesJsArray = new JSArray();
            for (HttpCookie cookie : cookies) {
                JSObject cookieJsPair = new JSObject();
                cookieJsPair.put("key", cookie.getName());
                cookieJsPair.put("value", cookie.getValue());
                cookiesJsArray.put(cookieJsPair);
            }
            JSObject cookiesJsObject = new JSObject();
            cookiesJsObject.put("cookies", cookiesJsArray);
            call.resolve(cookiesJsObject);
        }
    }

    @PluginMethod()
    public void getCookie(PluginCall call) {
        String key = call.getString("key");
        String url = getServerUrl(call);
        if (!url.isEmpty()) {
            HttpCookie cookie = cookieManager.getCookie(url, key);
            JSObject cookieJsObject = new JSObject();
            cookieJsObject.put("key", key);
            if (cookie != null) {
                cookieJsObject.put("value", cookie.getValue());
            } else {
                cookieJsObject.put("value", "");
            }
            call.resolve(cookieJsObject);
        }
    }

    @PluginMethod()
    public void deleteCookie(PluginCall call) {
        String key = call.getString("key");
        String url = getServerUrl(call);
        if (!url.isEmpty()) {
            cookieManager.setCookie(url, key + "=; Expires=Wed, 31 Dec 2000 23:59:59 GMT");
            call.resolve();
        }
    }

    @PluginMethod()
    public void clearCookies(PluginCall call) {
        cookieManager.removeAllCookies();
        call.resolve();
    }

    private void buildResponse(PluginCall call, HttpURLConnection conn) throws Exception {
        buildResponse(call, conn, ResponseType.DEFAULT);
    }

    private void buildResponse(PluginCall call, HttpURLConnection conn, ResponseType responseType) throws IOException, JSONException {
        int statusCode = conn.getResponseCode();

        JSObject ret = new JSObject();
        ret.put("status", statusCode);
        ret.put("headers", makeResponseHeaders(conn));
        ret.put("url", conn.getURL());

        Log.d(getLogTag(), "Request completed, got data");

        InputStream errorStream = conn.getErrorStream();
        String contentType = conn.getHeaderField("Content-Type");

        if (contentType != null && contentType.contains("application/json")) {
            // backward compatibility
            InputStream stream = (errorStream != null ? errorStream : conn.getInputStream());
            ret.put("data", parseJSON(readAsString(stream)));
        } else {
            InputStream inputStream = conn.getInputStream();
            switch (responseType) {
                case ARRAY_BUFFER:
                case BLOB:
                    ret.put("data", readAsBase64(inputStream));
                    break;
                case JSON:
                    ret.put("data", parseJSON(readAsString(inputStream)));
                    break;
                case DOCUMENT:
                case TEXT:
                    ret.put("data", readAsString(inputStream));
                    break;
            }
        }

        call.resolve(ret);
    }

    private JSArray makeResponseHeaders(HttpURLConnection conn) {
        JSArray ret = new JSArray();

        for (Map.Entry<String, List<String>> entries : conn.getHeaderFields().entrySet()) {
            JSObject header = new JSObject();

            StringBuilder val = new StringBuilder();
            for (String headerVal : entries.getValue()) {
                val.append(headerVal).append(", ");
            }

            header.put(entries.getKey(), val.toString());
            ret.put(header);
        }

        return ret;
    }

    private Object parseJSON(String input) throws JSONException {
        try {
            if ("null".equals(input)) {
                return JSONObject.NULL;
            } else {
                try {
                    return new JSObject(input);
                } catch (JSONException e) {
                    return new JSArray(input);
                }
            }
        } catch (JSONException e) {
            return new JSArray(input);
        }
    }

    private String readAsBase64(InputStream in) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[1024];
            int readBytes;
            while ((readBytes = in.read(buffer)) != -1) {
                out.write(buffer, 0, readBytes);
            }
            byte[] result = out.toByteArray();
            return Base64.encodeToString(result, 0, result.length, Base64.DEFAULT);
        }
    }

    private String readAsString(InputStream in) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(in))) {
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line).append(System.getProperty("line.separator"));
            }
            return builder.toString();
        }
    }

    private void setRequestHeaders(HttpURLConnection conn, JSObject headers) {
        Iterator<String> keys = headers.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            String value = headers.getString(key);
            conn.setRequestProperty(key, value);
        }
    }

    private URL setParams(URL url, JSObject params) {
        String newQuery = url.getQuery();
        Iterator<String> keys = params.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            String value = params.getString(key);
            if (newQuery == null) {
                newQuery = key + "=" + value;
            } else {
                newQuery += "&" + key + "=" + value;
            }
        }
        try {
            URI uri = url.toURI();
            URI newUri = new URI(uri.getScheme(), uri.getAuthority(), uri.getPath(), newQuery, uri.getFragment());
            return newUri.toURL();
        } catch (URISyntaxException | MalformedURLException e) {
            return url;
        }
    }

    private void writeToOutputStream(OutputStream out, String data) throws IOException {
        try (DataOutputStream os = new DataOutputStream(out)) {
            os.write(data.getBytes(StandardCharsets.UTF_8));
            os.flush();
        }
    }

    private void setRequestBody(HttpURLConnection conn, JSObject data, JSObject headers) throws IOException, JSONException {
        String contentType = conn.getRequestProperty("Content-Type");

        if (contentType != null) {
            if (contentType.contains("application/json")) {
                writeToOutputStream(conn.getOutputStream(), data.toString());
            } else if (contentType.contains("application/x-www-form-urlencoded")) {
                StringBuilder builder = new StringBuilder();

                Iterator<String> keys = data.keys();
                while (keys.hasNext()) {
                    String key = keys.next();
                    Object d = data.get(key);
                    if (d != null) {
                        builder.append(key).append("=").append(URLEncoder.encode(d.toString(), "UTF-8"));
                        if (keys.hasNext()) {
                            builder.append("&");
                        }
                    }
                }

                writeToOutputStream(conn.getOutputStream(), builder.toString());
            } else if (contentType.contains("multipart/form-data")) {
                FormUploader uploader = new FormUploader(conn);

                Iterator<String> keys = data.keys();
                while (keys.hasNext()) {
                    String key = keys.next();

                    String d = data.get(key).toString();
                    uploader.addFormField(key, d);
                }
                uploader.finish();
            }
        }
    }

    private URI getUri(String url) {
        try {
            return new URI(url);
        } catch (Exception ex) {
            return null;
        }
    }
}

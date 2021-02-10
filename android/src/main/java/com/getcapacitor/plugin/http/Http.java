package com.getcapacitor.plugin.http;

import android.Manifest;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.BufferedReader;
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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.json.JSONException;

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

    CapacitorCookieManager cookieManager;

    @Override
    public void load() {
        this.cookieManager = new CapacitorCookieManager(null, java.net.CookiePolicy.ACCEPT_ALL);
        java.net.CookieHandler.setDefault(cookieManager);
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

            URL url = new URL(urlString);
            HttpURLConnection conn = makeUrlConnection(url, method, connectTimeout, readTimeout, headers, params);

            buildResponse(call, conn);
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
        String url = call.getString("url");
        String key = call.getString("key");
        String value = call.getString("value");

        URI uri = getUri(url);
        if (uri == null) {
            call.reject("Invalid URL");
            return;
        }

        cookieManager.setCookie(url, key, value);

        call.resolve();
    }

    @PluginMethod()
    public void getCookies(PluginCall call) {
        String url = call.getString("url");

        URI uri = getUri(url);
        if (uri == null) {
            call.reject("Invalid URL");
            return;
        }

        HttpCookie[] cookies;

        try {
            cookies = cookieManager.getCookies(url);
        } catch (Exception ex) {
            call.reject("Unable to parse cookies", ex);
            return;
        }

        JSArray cookiesArray = new JSArray();

        for (HttpCookie cookie : cookies) {
            JSObject ret = new JSObject();
            ret.put("key", cookie.getName());
            ret.put("value", cookie.getValue());
            cookiesArray.put(ret);
        }

        JSObject ret = new JSObject();
        ret.put("value", cookiesArray);
        call.resolve(ret);
    }

    @PluginMethod()
    public void getCookie(PluginCall call) {
        String url = call.getString("url");
        String key = call.getString("key");

        URI uri = getUri(url);
        if (uri == null) {
            call.reject("Invalid URL");
            return;
        }

        HttpCookie cookie;
        try {
            cookie = cookieManager.getCookie(url, key);
        } catch (Exception ex) {
            call.reject("Unable to parse cookies", ex);
            return;
        }

        JSObject ret = new JSObject();
        ret.put("key", cookie.getName());
        ret.put("value", cookie.getValue());
        call.resolve(ret);
    }

    @PluginMethod()
    public void deleteCookie(PluginCall call) {
        String url = call.getString("url");
        String key = call.getString("key");

        URI uri = getUri(url);
        if (uri == null) {
            call.reject("Invalid URL");
            return;
        }

        cookieManager.setCookie(url, key + "=; Expires=Wed, 31 Dec 2000 23:59:59 GMT");

        call.resolve();
    }

    @PluginMethod()
    public void clearCookies(PluginCall call) {
        cookieManager.removeAllCookies();
        call.resolve();
    }

    private void buildResponse(PluginCall call, HttpURLConnection conn) throws Exception {
        int statusCode = conn.getResponseCode();

        JSObject ret = new JSObject();
        ret.put("status", statusCode);
        ret.put("headers", makeResponseHeaders(conn));
        ret.put("url", conn.getURL());

        InputStream errorStream = conn.getErrorStream();
        InputStream stream = (errorStream != null ? errorStream : conn.getInputStream());

        BufferedReader in = new BufferedReader(new InputStreamReader(stream));
        StringBuilder builder = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) {
            builder.append(line).append(System.getProperty("line.separator"));
        }
        in.close();

        Log.d(getLogTag(), "GET request completed, got data");

        String contentType = conn.getHeaderField("Content-Type");

        if (contentType != null) {
            if (contentType.contains("application/json")) {
                try {
                    JSObject jsonValue = new JSObject(builder.toString());
                    ret.put("data", jsonValue);
                } catch (JSONException e) {
                    JSArray jsonValue = new JSArray(builder.toString());
                    ret.put("data", jsonValue);
                }
            } else {
                ret.put("data", builder.toString());
            }
        } else {
            ret.put("data", builder.toString());
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

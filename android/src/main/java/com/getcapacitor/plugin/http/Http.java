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
        @Permission(strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "HttpRead")
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
        String url = call.getString("url", "");

        URI uri = getUri(url);
        if (uri == null) {
            call.reject("Invalid URL. Check that \"server\" is passed in correctly");
            return "";
        }

        return url;
    }

    /**
     * Try to parse a url string and if it can't be parsed, return null
     * @param url the url string to try to parse
     * @return a parsed URI
     */
    private URI getUri(String url) {
        try {
            return new URI(url);
        } catch (Exception ex) {
            return null;
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

    private void http(final PluginCall call, final String httpMethod) {
        new Thread(
            new Runnable() {
                public void run() {
                    try {
                        JSObject response = HttpRequestHandler.request(call, httpMethod);
                        call.resolve(response);
                    } catch (Exception e) {
                        System.out.println(e.toString());
                        call.reject(e.getClass().getSimpleName(), e);
                    }
                }
            }
        )
            .start();
    }

    @Override
    public void load() {
        this.cookieManager = new CapacitorCookieManager(null, java.net.CookiePolicy.ACCEPT_ALL);
        java.net.CookieHandler.setDefault(cookieManager);
        capConfig = getBridge().getConfig();
    }

    @PluginMethod
    public void request(final PluginCall call) {
        this.http(call, null);
    }

    @PluginMethod
    public void get(final PluginCall call) {
        this.http(call, "GET");
    }

    @PluginMethod
    public void post(final PluginCall call) {
        this.http(call, "POST");
    }

    @PluginMethod
    public void put(final PluginCall call) {
        this.http(call, "PUT");
    }

    @PluginMethod
    public void patch(final PluginCall call) {
        this.http(call, "PATCH");
    }

    @PluginMethod
    public void del(final PluginCall call) {
        this.http(call, "DELETE");
    }

    @PluginMethod
    public void downloadFile(PluginCall call) {
        try {
            bridge.saveCall(call);
            String fileDirectory = call.getString("fileDirectory", FilesystemUtils.DIRECTORY_DOCUMENTS);

            if (
                !FilesystemUtils.isPublicDirectory(fileDirectory) ||
                isStoragePermissionGranted(call, Manifest.permission.WRITE_EXTERNAL_STORAGE)
            ) {
                call.release(bridge);
                JSObject response = HttpRequestHandler.downloadFile(call, getContext());

                call.resolve(response);
            }
        } catch (MalformedURLException ex) {
            call.reject("Invalid URL", ex);
        } catch (IOException ex) {
            call.reject("IO Error", ex);
        } catch (Exception ex) {
            call.reject("Error", ex);
        }
    }

    @PluginMethod
    public void uploadFile(PluginCall call) {
        try {
            String fileDirectory = call.getString("fileDirectory", FilesystemUtils.DIRECTORY_DOCUMENTS);
            bridge.saveCall(call);

            if (
                !FilesystemUtils.isPublicDirectory(fileDirectory) ||
                isStoragePermissionGranted(call, Manifest.permission.WRITE_EXTERNAL_STORAGE)
            ) {
                call.release(bridge);
                JSObject response = HttpRequestHandler.uploadFile(call, getContext());
                call.resolve(response);
            }
        } catch (Exception ex) {
            call.reject("Error", ex);
        }
    }

    @PluginMethod
    public void setCookie(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");
        String url = getServerUrl(call);

        if (!url.isEmpty()) {
            cookieManager.setCookie(url, key, value);
            call.resolve();
        }
    }

    @PluginMethod
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

    @PluginMethod
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

    @PluginMethod
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

    @PluginMethod
    public void deleteCookie(PluginCall call) {
        String key = call.getString("key");
        String url = getServerUrl(call);
        if (!url.isEmpty()) {
            cookieManager.setCookie(url, key + "=; Expires=Wed, 31 Dec 2000 23:59:59 GMT");
            call.resolve();
        }
    }

    @PluginMethod
    public void clearCookies(PluginCall call) {
        cookieManager.removeAllCookies();
        call.resolve();
    }
}

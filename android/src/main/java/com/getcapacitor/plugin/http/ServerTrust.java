package com.getcapacitor.plugin.http;

import android.app.Activity;
import android.content.res.AssetManager;

import com.getcapacitor.plugin.http.ssl.TLSConfig;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

public class ServerTrust implements Runnable {

    private String mode = "default";
    private Activity activity;

    private final TrustManager[] trustManagers;
    private final HostnameVerifier hostnameVerifier;
    private TLSConfig tlsConfig;

    public ServerTrust(String mode, Activity activity) {
        this.mode = mode;
        this.activity = activity;

        this.trustManagers = new TrustManager[] { new X509TrustManager() {
            @Override
            public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {

            }

            @Override
            public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {

            }

            @Override
            public X509Certificate[] getAcceptedIssuers() {
                return new X509Certificate[0];
            }
        }};


        this.hostnameVerifier = new HostnameVerifier() {
            @Override
            public boolean verify(String hostname, SSLSession session) {
                return true;
            }
        };
    }

    @Override
    public void run() {
        try {
            if ("legacy".equals(this.mode)) {
                this.tlsConfig.setHostnameVerifier(null);
                this.tlsConfig.setTrustManagers(null);
            } else if ("nocheck".equals(this.mode)) {
                this.tlsConfig.setHostnameVerifier(this.hostnameVerifier);
                this.tlsConfig.setTrustManagers(this.trustManagers);
            } else if ("pinned".equals(this.mode)) {
                this.tlsConfig.setHostnameVerifier(null);
                this.tlsConfig.setTrustManagers(this.getTrustManagers(this.getCertsFromBundle("certificates")));
            } else {
                this.tlsConfig.setHostnameVerifier(null);
                this.tlsConfig.setTrustManagers(this.getTrustManagers(this.getCertsFromKeyStore("AndroidCAStore")));
            }
        } catch (Exception ex) {

        }
    }

    private TrustManager[] getTrustManagers(KeyStore store) throws GeneralSecurityException {
        String tmfAlgo = TrustManagerFactory.getDefaultAlgorithm();
        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(tmfAlgo);
        trustManagerFactory.init(store);

        return trustManagerFactory.getTrustManagers();
    }

    private KeyStore getCertsFromBundle(String path) throws GeneralSecurityException, IOException {
        AssetManager assetManager = this.activity.getAssets();
        String[] files = assetManager.list(path);

        CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");
        String keystoreType = KeyStore.getDefaultType();
        KeyStore keyStore = KeyStore.getInstance(keystoreType);

        keyStore.load(null, null);

        for (int i = 0; i < files.length; i++) {
            int index = files[i].lastIndexOf('.');

            if (index == -1 || !files[i].substring(index).equals(".cer")) {
                continue;
            }

            keyStore.setCertificateEntry("CA" + i, certificateFactory.generateCertificate(assetManager.open(path + "/" + files[i])));
        }

        return keyStore;
    }

    private KeyStore getCertsFromKeyStore(String storeType) throws GeneralSecurityException, IOException {
        KeyStore store = KeyStore.getInstance(storeType);
        store.load(null);

        return store;
    }
}

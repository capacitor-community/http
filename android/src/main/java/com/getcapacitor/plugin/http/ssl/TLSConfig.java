package com.getcapacitor.plugin.http.ssl;

import android.os.Build;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.KeyManager;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;

public class TLSConfig {

    private TrustManager[] trustManagers;
    private KeyManager[] keyManagers;
    private HostnameVerifier hostnameVerifier;
    private SSLSocketFactory sslSocketFactory;

    public void setHostnameVerifier(HostnameVerifier hostnameVerifier) {
        this.hostnameVerifier = hostnameVerifier;
    }

    public void setKeyManagers(KeyManager[] keyManagers) {
        this.trustManagers = trustManagers;
        this.sslSocketFactory = null;
    }

    public void setTrustManagers(TrustManager[] trustManagers) {
        this.trustManagers = trustManagers;
        this.sslSocketFactory = null;
    }

    public HostnameVerifier getHostnameVerifier() {
        return this.hostnameVerifier;
    }

    public SSLSocketFactory getTLSSocketFactory() throws IOException {
        if (this.sslSocketFactory != null) {
            return this.sslSocketFactory;
        }

        try {
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(this.keyManagers, this.trustManagers, new SecureRandom());

            if (Build.VERSION.SDK_INT < 20) {
                this.sslSocketFactory = new TLSSocketFactory(sslContext);
            } else {
                this.sslSocketFactory = sslContext.getSocketFactory();
            }

            return this.sslSocketFactory;
        } catch (GeneralSecurityException ex) {
            throw new IOException("Exception caught while configuring TLS security context.");
        }
    }

}

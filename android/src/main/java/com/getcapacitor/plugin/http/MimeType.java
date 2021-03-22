package com.getcapacitor.plugin.http;

enum MimeType  {

    APPLICATION_JSON("application/json"),
    TEXT_HTML("text/html");

    private final String value;

    MimeType(String value) {
        this.value = value;
    }

    String getValue() {
        return value;
    }
}

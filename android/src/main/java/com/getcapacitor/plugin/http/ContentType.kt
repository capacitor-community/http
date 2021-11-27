package com.getcapacitor.plugin.http

import java.util.Locale

// Common Http Headers from here
// https://stackoverflow.com/questions/53138172/how-to-implement-switch-case-statement-in-kotlin
enum class ContentType(private val value: String) {
    // Application
    APPLICATION_OCTET_STREAM("application/octet-stream"),
    APPLICATION_OGG("application/ogg"),
    APPLICATION_PDF("application/pdf"),
    APPLICATION_XHTML_XML("application/xhtml+xml"),
    APPLICATION_JSON(" application/json"),
    APPLICATION_LD_JSON("application/ld+json"),
    APPLICATION_VND_API_JSON("application/vnd.api+json"),
    APPLICATION_XML("application/xml"),
    APPLICATION_ZIP("application/zip"),
    APPLICATION_X_WWW_FORM_URLENCODED("application/x-www-form-urlencoded"),

    // Audio
    AUDIO_MPEG("audio/mpeg"),
    AUDIO_X_MS_WMA("audio/x-ms-wma"),
    AUDIO_VND_RN_REALAUDIO("audio/vnd.rn-realaudio"),
    AUDIO_X_WAV("audio/x-wav"),

    // Image
    IMAGE_GIF("image/gif"),
    IMAGE_JPEG("image/jpeg"),
    IMAGE_PNG("image/png"),
    IMAGE_TIFF("image/tiff"),
    IMAGE_X_ICON("image/x-icon"),
    IMAGE_SVG_XML("image/svg+xml"),

    // Multipart
    MULTIPART_MIXED("multipart/mixed"),
    MULTIPART_ALTERNATIVE("multipart/alternative"),
    MULTIPART_FORM_DATA("multipart/form-data"),

    // Text
    TEXT_CSS("text/css"),
    TEXT_CSV("text/csv"),
    TEXT_HTML("text/html"),
    TEXT_PLAIN("text/plain"),
    TEXT_XML("text/xml"),

    // Video
    VIDEO_MPEG("video/mpeg"),
    VIDEO_MP4("video/mp4"),
    VIDEO_QUICKTIME("video/quicktime"),
    VIDEO_X_MS_WMV("video/x-ms-wmv"),
    VIDEO_X_FLV("video/x-flv"),
    VIDEO_WEBM("video/webm"),

    // Unknown
    UNKNOWN("");

    fun getValue(): String {
        return value
    }

    fun getDomain(): String {
        return value.split('_')[0]
    }

    companion object {
        fun parse(str: String): ContentType {
            val first = str.lowercase(Locale.getDefault()).split(";")[0].trim()
            when(first) {
                "application/json" -> return APPLICATION_JSON
                "application/octet-stream" -> return APPLICATION_OCTET_STREAM
                "application/ogg" -> return APPLICATION_OGG
                "application/pdf" -> return APPLICATION_PDF
                "application/xhtml+xml" -> return APPLICATION_XHTML_XML
                "application/ld+json" -> return APPLICATION_LD_JSON
                "application/vnd.api+json" -> return APPLICATION_VND_API_JSON
                "application/xml" -> return APPLICATION_XML
                "application/zip" -> return APPLICATION_ZIP
                "application/x-www-form-urlencoded" -> return APPLICATION_X_WWW_FORM_URLENCODED
                "audio/mpeg" -> return AUDIO_MPEG
                "audio/x-ms-wma" -> return AUDIO_X_MS_WMA
                "audio/vnd.rn-realaudio" -> return AUDIO_VND_RN_REALAUDIO
                "audio/x-wav" -> return AUDIO_X_WAV
                "image/gif" -> return IMAGE_GIF
                "image/jpg" -> return IMAGE_JPEG
                "image/jpeg" -> return IMAGE_JPEG
                "image/png" -> return IMAGE_PNG
                "image/tiff" -> return IMAGE_TIFF
                "image/x-icon" -> return IMAGE_X_ICON
                "image/svg+xml" -> return IMAGE_SVG_XML
                "multipart/mixed" -> return MULTIPART_MIXED
                "multipart/alternative" -> return MULTIPART_ALTERNATIVE
                "multipart/form-data" -> return MULTIPART_FORM_DATA
                "text/css" -> return TEXT_CSS
                "text/csv" -> return TEXT_CSV
                "text/html" -> return TEXT_HTML
                "text/plain" -> return TEXT_PLAIN
                "text/xml" -> return TEXT_XML
                "video/mpeg" -> return VIDEO_MPEG
                "video/mp4" -> return VIDEO_MP4
                "video/quicktime" -> return VIDEO_QUICKTIME
                "video/x-ms-wmv" -> return VIDEO_X_MS_WMV
                "video/x-flv" -> return VIDEO_X_FLV
                "video/webm" -> return VIDEO_WEBM
            }

            return UNKNOWN
        }
    }
}
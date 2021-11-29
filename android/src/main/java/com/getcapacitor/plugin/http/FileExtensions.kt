package com.getcapacitor.plugin.http

import android.content.Context
import android.net.Uri
import android.os.Environment
import java.io.File

object FileExtensions {
    const val DIRECTORY_DOCUMENTS = "DOCUMENTS"
    private const val DIRECTORY_APPLICATION = "APPLICATION"
    private const val DIRECTORY_DOWNLOADS = "DOWNLOADS"
    private const val DIRECTORY_DATA = "DATA"
    private const val DIRECTORY_CACHE = "CACHE"
    private const val DIRECTORY_EXTERNAL = "EXTERNAL"
    private const val DIRECTORY_EXTERNAL_STORAGE = "EXTERNAL_STORAGE"

    fun getFile(context: Context, path: String, directory: String?): File {
        if (directory == null || path.startsWith("file://")) {
            val uri = Uri.parse(path)
            if ((uri.scheme == null || uri.scheme == "file") && uri.path != null) {
                return File(uri.path!!)
            }
        }

        val androidDirectory = getDirectory(context, directory)!!
        if (!androidDirectory.exists()) {
            androidDirectory.mkdir()
        }

        return File(androidDirectory, path)
    }

    fun getDirectory(context: Context, directory: String?): File? {
        when (directory) {
            DIRECTORY_APPLICATION, DIRECTORY_DATA -> return context.filesDir
            DIRECTORY_DOCUMENTS -> return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
            DIRECTORY_DOWNLOADS -> return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            DIRECTORY_CACHE -> return context.cacheDir
            DIRECTORY_EXTERNAL -> return context.getExternalFilesDir(null)
            DIRECTORY_EXTERNAL_STORAGE -> return Environment.getExternalStorageDirectory()
        }
        return null
    }

    /**
     * True if the given directory string is a public storage directory, which is accessible by the user or other apps.
     * @param directory the directory string.
     */
    fun isPublicDirectory(directory: String): Boolean {
        return DIRECTORY_DOCUMENTS == directory || DIRECTORY_DOWNLOADS == directory || "EXTERNAL_STORAGE" == directory
    }
}
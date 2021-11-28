package com.getcapacitor.plugin.http

@FunctionalInterface
interface IProgressCallback {
    fun onProgress(progress: Double)
}
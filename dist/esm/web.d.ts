import { HttpPlugin, HttpOptions, HttpDeleteCookieOptions, HttpResponse, HttpSetCookieOptions, HttpClearCookiesOptions, HttpGetCookiesOptions, HttpGetCookiesResult, HttpDownloadFileOptions, HttpDownloadFileResult, HttpUploadFileOptions, HttpUploadFileResult } from './definitions';
import { WebPlugin } from '@capacitor/core';
export declare class HttpPluginWeb extends WebPlugin implements HttpPlugin {
    constructor();
    private getRequestHeader;
    private nativeHeadersToObject;
    private makeFetchOptions;
    request(options: HttpOptions): Promise<HttpResponse>;
    setCookie(options: HttpSetCookieOptions): Promise<void>;
    getCookies(_options: HttpGetCookiesOptions): Promise<HttpGetCookiesResult>;
    deleteCookie(options: HttpDeleteCookieOptions): Promise<void>;
    clearCookies(_options: HttpClearCookiesOptions): Promise<void>;
    uploadFile(options: HttpUploadFileOptions): Promise<HttpUploadFileResult>;
    downloadFile(options: HttpDownloadFileOptions): Promise<HttpDownloadFileResult>;
}
declare const Http: HttpPluginWeb;
export { Http };

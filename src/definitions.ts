import { Directory } from '@capacitor/filesystem';

type HttpResponseType = 'arraybuffer' | 'blob' | 'json' | 'text' | 'document';

export interface HttpPlugin {
  request(options: HttpOptions): Promise<HttpResponse>;
  get(options: HttpOptions): Promise<HttpResponse>;
  post(options: HttpOptions): Promise<HttpResponse>;
  put(options: HttpOptions): Promise<HttpResponse>;
  patch(options: HttpOptions): Promise<HttpResponse>;
  del(options: HttpOptions): Promise<HttpResponse>;

  setCookie(options: HttpSetCookieOptions): Promise<void>;
  getCookie(options: HttpSingleCookieOptions): Promise<HttpCookie>;
  getCookies(options: HttpMultiCookiesOptions): Promise<HttpGetCookiesResult>;
  getCookiesMap(): Promise<HttpCookieMap>;
  clearCookies(options: HttpMultiCookiesOptions): Promise<void>;
  deleteCookie(options: HttpSingleCookieOptions): Promise<void>;

  uploadFile(options: HttpUploadFileOptions): Promise<HttpUploadFileResult>;
  chunkUpload(options: HttpUploadFileOptions): Promise<HttpUploadFileResult>;
  downloadFile(
    options: HttpDownloadFileOptions,
  ): Promise<HttpDownloadFileResult>;
}

export interface HttpOptions {
  url: string;
  method?: string;
  params?: HttpParams;
  data?: any;
  headers?: HttpHeaders;
  /**
   * How long to wait to read additional data. Resets each time new
   * data is received
   */
  readTimeout?: number;
  /**
   * How long to wait for the initial connection.
   */
  connectTimeout?: number;
  /**
   * Sets whether automatic HTTP redirects should be disabled
   */
  disableRedirects?: boolean;
  /**
   * Extra arguments for fetch when running on the web
   */
  webFetchExtra?: RequestInit;
  /**
   * This is used to parse the response appropriately before returning it to
   * the requestee. If the response content-type is "json", this value is ignored.
   */
  responseType?: HttpResponseType;
  /**
   * Use this option if you need to keep the URL unencoded in certain cases
   * (already encoded, azure/firebase testing, etc.). The default is _true_.
   */
  shouldEncodeUrlParams?: boolean;
}

export interface HttpParams {
  [key: string]: string | string[];
}

export interface HttpHeaders {
  [key: string]: string;
}

export interface HttpResponse {
  data: any;
  status: number;
  headers: HttpHeaders;
  url: string;
}

export interface HttpDownloadFileOptions extends HttpOptions {
  /**
   * The path the downloaded file should be moved to
   */
  filePath: string;
  /**
   * Optionally, the directory to put the file in
   *
   * If this option is used, filePath can be a relative path rather than absolute
   */
  fileDirectory?: Directory;
}

export interface HttpUploadFileOptions extends HttpOptions {
  /**
   * The URL to upload the file to
   */
  url: string;
  /**
   * The field name to upload the file with
   */
  name: string;
  /**
   * For uploading a file on the web, a JavaScript Blob to upload
   */
  blob?: Blob;
  /**
   * For uploading a file natively, the path to the file on disk to upload
   */
  filePath?: string;
  /**
   * Optionally, the directory to look for the file in.
   *
   * If this option is used, filePath can be a relative path rather than absolute
   */
  fileDirectory?: Directory;
}

export interface HttpCookie {
  key: string;
  value: string;
}

export interface HttpCookieMap {
  [key: string]: any;
}

export interface HttpCookieOptions {
  url?: string;
  path?: string;
  expires?: string;
}

export interface HttpSingleCookieOptions {
  url: string;
  key: string;
}

export interface HttpSetCookieOptions {
  url: string;
  key: string;
  value: string;
  path?: string;
  expires?: string;
}

export interface HttpMultiCookiesOptions {
  url: string;
}

export interface HttpCookieExtraOptions {
  path?: string;
  expires?: string;
}

export interface HttpGetCookiesResult {
  cookies: HttpCookie[];
}

export interface HttpDownloadFileResult {
  path?: string;
  blob?: Blob;
}

export interface HttpUploadFileResult extends HttpResponse {}

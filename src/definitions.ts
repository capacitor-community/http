import { Directory } from '@capacitor/filesystem';

export interface HttpPlugin {
  request(options: HttpOptions): Promise<HttpResponse>;
  setCookie(options: HttpSetCookieOptions): Promise<void>;
  getCookies(options: HttpGetCookiesOptions): Promise<HttpGetCookiesResult>;
  deleteCookie(options: HttpDeleteCookieOptions): Promise<void>;
  clearCookies(options: HttpClearCookiesOptions): Promise<void>;
  uploadFile(options: HttpUploadFileOptions): Promise<HttpUploadFileResult>;
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
   * Extra arguments for fetch when running on the web
   */
  webFetchExtra?: RequestInit;
}

export interface HttpParams {
  [key: string]: string;
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

export interface HttpSetCookieOptions {
  /** @deprecated */
  url?: string;
  /** @deprecated Use parameters instead */
  key?: string;
  /** @deprecated Use parameters instead */
  value?: string;
  /** @deprecated Use expires instead */
  ageDays?: number;
  expires?: string;
}

export interface HttpGetCookiesOptions {
  url: string;
}

export interface HttpDeleteCookieOptions {
  url: string;
  key: string;
}

export interface HttpClearCookiesOptions {
  url: string;
}

export interface HttpGetCookiesResult {
  value: HttpCookie[];
}

export interface HttpDownloadFileResult {
  path?: string;
  blob?: Blob;
}

export interface HttpUploadFileResult extends HttpResponse {}

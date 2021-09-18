import type {
  HttpPlugin,
  HttpOptions,
  HttpResponse,
  HttpDownloadFileOptions,
  HttpDownloadFileResult,
  HttpUploadFileOptions,
  HttpUploadFileResult,
  HttpCookie,
  HttpCookieMap,
  HttpGetCookiesResult,
  HttpSetCookieOptions,
  HttpMultiCookiesOptions,
  HttpSingleCookieOptions,
  ProgressStatus,
} from './definitions';
import { WebPlugin } from '@capacitor/core';
import * as Cookie from './cookie';
import * as Request from './request';

export class HttpWeb extends WebPlugin implements HttpPlugin {
  constructor() {
    super();
  }

  /**
   * Perform an Http request given a set of options
   * @param options Options to build the HTTP request
   */
  public request = async (options: HttpOptions): Promise<HttpResponse> =>
    Request.request(options);

  /**
   * Perform an Http GET request given a set of options
   * @param options Options to build the HTTP request
   */
  public get = async (options: HttpOptions): Promise<HttpResponse> =>
    Request.get(options);

  /**
   * Perform an Http POST request given a set of options
   * @param options Options to build the HTTP request
   */
  public post = async (options: HttpOptions): Promise<HttpResponse> =>
    Request.post(options);

  /**
   * Perform an Http PUT request given a set of options
   * @param options Options to build the HTTP request
   */
  public put = async (options: HttpOptions): Promise<HttpResponse> =>
    Request.put(options);

  /**
   * Perform an Http PATCH request given a set of options
   * @param options Options to build the HTTP request
   */
  public patch = async (options: HttpOptions): Promise<HttpResponse> =>
    Request.patch(options);

  /**
   * Perform an Http DELETE request given a set of options
   * @param options Options to build the HTTP request
   */
  public del = async (options: HttpOptions): Promise<HttpResponse> =>
    Request.del(options);

  /**
   * Gets all HttpCookies as a Map
   */
  public getCookiesMap = async (
    // @ts-ignore
    options: HttpMultiCookiesOptions,
  ): Promise<HttpCookieMap> => {
    const cookies = Cookie.getCookies();
    const output: HttpCookieMap = {};

    for (const cookie of cookies) {
      output[cookie.key] = cookie.value;
    }

    return output;
  };

  /**
   * Get all HttpCookies as an object with the values as an HttpCookie[]
   */
  public getCookies = async (
    options: HttpMultiCookiesOptions,
  ): Promise<HttpGetCookiesResult> => {
    // @ts-ignore
    const { url } = options;

    const cookies = Cookie.getCookies();
    return { cookies };
  };

  /**
   * Set a cookie
   * @param key The key to set
   * @param value The value to set
   * @param options Optional additional parameters
   */
  public setCookie = async (options: HttpSetCookieOptions): Promise<void> => {
    const { key, value, expires = '', path = '' } = options;
    Cookie.setCookie(key, value, { expires, path });
  };

  /**
   * Gets all cookie values unless a key is specified, then return only that value
   * @param key The key of the cookie value to get
   */
  public getCookie = async (
    options: HttpSingleCookieOptions,
  ): Promise<HttpCookie> => Cookie.getCookie(options.key);

  /**
   * Deletes a cookie given a key
   * @param key The key of the cookie to delete
   */
  public deleteCookie = async (
    options: HttpSingleCookieOptions,
  ): Promise<void> => Cookie.deleteCookie(options.key);

  /**
   * Clears out cookies by setting them to expire immediately
   */
  public clearCookies = async (
    // @ts-ignore
    options: HttpMultiCookiesOptions,
  ): Promise<void> => Cookie.clearCookies();

  /**
   * Clears out cookies by setting them to expire immediately
   */
  public clearAllCookies = async (): Promise<void> => Cookie.clearCookies();

  /**
   * Uploads a file through a POST request
   * @param options TODO
   */
  public uploadFile = async (
    options: HttpUploadFileOptions,
  ): Promise<HttpUploadFileResult> => {
    const formData = new FormData();
    formData.append(options.name, options.blob || 'undefined');
    const fetchOptions = {
      ...options,
      body: formData,
      method: 'POST',
    };

    return this.post(fetchOptions);
  };

  /**
   * Downloads a file
   * @param options TODO
   */
  public downloadFile = async (
    options: HttpDownloadFileOptions,
  ): Promise<HttpDownloadFileResult> => {
    const requestInit = Request.buildRequestInit(
      options,
      options.webFetchExtra,
    );
    const response = await fetch(options.url, requestInit);
    let blob: Blob;

    if (!options?.progress) blob = await response.blob();
    else if (!response?.body) blob = new Blob();
    else {
      const reader = response.body.getReader();

      let bytes: number = 0;
      let chunks: Array<Uint8Array | undefined> = [];

      const contentType: string | null = response.headers.get('content-type');
      const contentLength: number = parseInt(
        response.headers.get('content-length') || '0',
        10,
      );

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        bytes += value?.length || 0;

        const status: ProgressStatus = {
          type: 'DOWNLOAD',
          url: options.url,
          bytes,
          contentLength,
        };

        this.notifyListeners('progress', status);
      }

      let allChunks = new Uint8Array(bytes);
      let position: number = 0;
      for (const chunk of chunks) {
        if (typeof chunk === 'undefined') continue;

        allChunks.set(chunk, position);
        position += chunk.length;
      }

      blob = new Blob([allChunks.buffer], { type: contentType || undefined });
    }

    return {
      blob,
    };
  };
}

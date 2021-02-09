import type {
  HttpPlugin,
  HttpOptions,
  HttpDeleteCookieOptions,
  HttpHeaders,
  HttpResponse,
  HttpSetCookieOptions,
  HttpClearCookiesOptions,
  HttpGetCookiesOptions,
  HttpGetCookiesResult,
  HttpParams,
  HttpDownloadFileOptions,
  HttpDownloadFileResult,
  HttpUploadFileOptions,
  HttpUploadFileResult,
  HttpCookie,
} from './definitions';
import { WebPlugin } from '@capacitor/core';
import { getCookie, setCookie, clearCookies, deleteCookie } from './cookie';

export class HttpWeb extends WebPlugin implements HttpPlugin {
  constructor() {
    super();
  }

  private getRequestHeader(headers: HttpHeaders, key: string): string {
    const originalKeys = Object.keys(headers);
    const keys = Object.keys(headers).map(k => k.toLocaleLowerCase());
    const lowered = keys.reduce((newHeaders, key, index) => {
      newHeaders[key] = headers[originalKeys[index]];
      return newHeaders;
    }, {} as HttpHeaders);

    return lowered[key.toLocaleLowerCase()];
  }

  private nativeHeadersToObject(headers: Headers): HttpHeaders {
    const h = {} as HttpHeaders;

    headers.forEach((value: string, key: string) => {
      h[key] = value;
    });

    return h;
  }

  private makeFetchOptions(
    options: HttpOptions,
    fetchExtra: RequestInit = {},
  ): RequestInit {
    const req = {
      method: options.method || 'GET',
      headers: options.headers,
      ...fetchExtra,
    } as RequestInit;

    const contentType =
      this.getRequestHeader(options.headers || {}, 'content-type') || '';

    if (contentType.indexOf('application/json') === 0) {
      req['body'] = JSON.stringify(options.data);
    } else if (contentType.indexOf('application/x-www-form-urlencoded') === 0) {
      const urlSearchParams = new URLSearchParams();
      for (let key of Object.keys(options.data)) {
        urlSearchParams.set(key, options.data[key]);
      }
      req['body'] = urlSearchParams.toString();
    } else if (
      contentType.indexOf('multipart/form-data') === 0 ||
      typeof options.data === 'object'
    ) {
      let formData = new FormData();
      for (let key of Object.keys(options.data)) {
        formData.append(key, options.data[key]);
      }
      req['body'] = formData;
    }

    return req;
  }

  private makeFetchParams(params?: HttpParams): string | null {
    if (!params) return null;
    return Object.entries(params).reduce((prev, [key, value]) => {
      const encodedValue = encodeURIComponent(value);
      const keyValue = `${key}=${encodedValue}`;
      return prev ? `${prev}&${keyValue}` : keyValue;
    }, '');
  }

  async request(options: HttpOptions): Promise<HttpResponse> {
    const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);

    const fetchParams = this.makeFetchParams(options.params);
    const fetchUrl = fetchParams
      ? `${options.url}?${fetchParams}`
      : options.url;

    const ret = await fetch(fetchUrl, fetchOptions);

    const contentType = ret.headers.get('content-type');

    let data;
    if (contentType && contentType.indexOf('application/json') === 0) {
      data = await ret.json();
    } else {
      data = await ret.text();
    }

    return {
      status: ret.status,
      data,
      headers: this.nativeHeadersToObject(ret.headers),
      url: ret.url,
    };
  }

  /**
   * @deprecated Use cookie.setCookie instead
   * @param options
   */
  async setCookie(options: HttpSetCookieOptions) {
    const key = options.key as string;
    const value = options.value;
    setCookie(key, value, options);
  }

  /**
   * @deprecated Use cookie.getCookie instead
   * @param _options
   */
  async getCookies(
    _options: HttpGetCookiesOptions,
  ): Promise<HttpGetCookiesResult> {
    if (!document.cookie) {
      return { value: [] };
    }

    const cookies = getCookie();
    const entries: [string, any][] = Object.entries(cookies);
    const output: HttpCookie[] = new Array();
    for (const [key, value] of entries) {
      output.push({
        key,
        value,
      });
    }

    return {
      value: output,
    };
  }

  /**
   * @deprecated Use cookie.deleteCookie instead
   */
  async deleteCookie(options: HttpDeleteCookieOptions) {
    deleteCookie(options.key);
  }

  /**
   * @deprecated Use cookie.clearCookies instead
   */
  async clearCookies(_options: HttpClearCookiesOptions) {
    clearCookies();
  }

  async uploadFile(
    options: HttpUploadFileOptions,
  ): Promise<HttpUploadFileResult> {
    const formData = new FormData();
    formData.append(options.name, options.blob || 'undefined');

    const fetchOptions = {
      ...options,
      body: formData,
      method: 'POST',
    };

    return this.request(fetchOptions);
  }

  async downloadFile(
    options: HttpDownloadFileOptions,
  ): Promise<HttpDownloadFileResult> {
    const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);

    const ret = await fetch(options.url, fetchOptions);

    const blob = await ret.blob();

    return {
      blob,
    };
  }
}

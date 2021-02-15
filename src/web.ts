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
} from './definitions';
import { WebPlugin } from '@capacitor/core';

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

    let data;
    const contentType = ret.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') === 0) {
      data = await ret.json();
    } else {
      switch (options.responseType) {
        case 'arraybuffer':
        case 'blob':
          data = await this.readAsBase64(await ret.blob());
          break;

        case 'json':
          data = await ret.json();
          break;

        case 'document':
        case 'text':
        default:
          data = await ret.text();    
          break;
        }
    }

    return {
      status: ret.status,
      data,
      headers: this.nativeHeadersToObject(ret.headers),
      url: ret.url,
    };
  }

  private async readAsBase64(blob: Blob): Promise<string> {    
    var resolveCallback: (result: any) => void;
    var rejectCallback: (error: any) => void;
    
    const promise = new Promise<string>((resolve, reject) => {
      resolveCallback = resolve;
      rejectCallback = reject;
    });
    
    const reader = new FileReader(); 

    reader.onload = () => { 
      const base64String = reader.result as string; 
      const base64StringWithoutTags = base64String.substr(base64String.indexOf(',') + 1); // remove prefix "data:application/pdf;base64,"      
      resolveCallback(base64StringWithoutTags);
    }
    reader.onerror = (error: any) => rejectCallback(error);

    reader.readAsDataURL(blob);
    
    return promise;
}

  async setCookie(options: HttpSetCookieOptions) {
    var expires = '';
    if (options.expires) {
      // remove "expires=" so you can pass with or without the prefix
      expires = `; expires=${expires.replace('expires=', '')}`;
    } else if (options.ageDays) {
      const date = new Date();
      date.setTime(date.getTime() + options.ageDays * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie =
      options.key + '=' + (options.value || '') + expires + '; path=/';
  }

  async getCookies(
    _options: HttpGetCookiesOptions,
  ): Promise<HttpGetCookiesResult> {
    if (!document.cookie) {
      return { value: [] };
    }

    var cookies = document.cookie.split(';');
    return {
      value: cookies.map(c => {
        const cParts = c.split(';').map(cv => cv.trim());
        const cNameValue = cParts[0];
        const cValueParts = cNameValue.split('=');
        const key = cValueParts[0];
        const value = cValueParts[1];

        return {
          key,
          value,
        };
      }),
    };
  }

  async deleteCookie(options: HttpDeleteCookieOptions) {
    document.cookie = options.key + '=; Max-Age=0';
  }

  async clearCookies(_options: HttpClearCookiesOptions) {
    document.cookie
      .split(';')
      .forEach(
        c =>
          (document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)),
      );
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

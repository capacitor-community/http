import type {
  HttpOptions,
  HttpResponse,
  HttpParams,
  HttpHeaders,
} from './definitions';
import { readBlobAsBase64 } from './utils';

/**
 * Normalize an HttpHeaders map by lowercasing all of the values
 * @param headers The HttpHeaders object to normalize
 */
const normalizeHttpHeaders = (headers: HttpHeaders = {}): HttpHeaders => {
  const originalKeys = Object.keys(headers);
  const loweredKeys = Object.keys(headers).map(k => k.toLocaleLowerCase());
  const normalized = loweredKeys.reduce<HttpHeaders>((acc, key, index) => {
    acc[key] = headers[originalKeys[index]];
    return acc;
  }, {});
  return normalized;
};

/**
 * Builds a string of url parameters that
 * @param params A map of url parameters
 * @param shouldEncode true if you should encodeURIComponent() the values (true by default)
 */
const buildUrlParams = (
  params?: HttpParams,
  shouldEncode: boolean = true,
): string | null => {
  if (!params) return null;

  const output = Object.entries(params).reduce((accumulator, entry) => {
    const [key, value] = entry;

    let encodedValue: string;
    let item: string;
    if (Array.isArray(value)) {
      item = '';
      value.forEach(str => {
        encodedValue = shouldEncode ? encodeURIComponent(str) : str;
        item += `${key}=${encodedValue}&`;
      });
      // last character will always be "&" so slice it off
      item.slice(0, -1);
    } else {
      encodedValue = shouldEncode ? encodeURIComponent(value) : value;
      item = `${key}=${encodedValue}`;
    }

    return `${accumulator}&${item}`;
  }, '');

  // Remove initial "&" from the reduce
  return output.substr(1);
};

/**
 * Build the RequestInit object based on the options passed into the initial request
 * @param options The Http plugin options
 * @param extra Any extra RequestInit values
 */
export const buildRequestInit = (
  options: HttpOptions,
  extra: RequestInit = {},
): RequestInit => {
  const output: RequestInit = {
    method: options.method || 'GET',
    headers: options.headers,
    ...extra,
  };

  // Get the content-type
  const headers = normalizeHttpHeaders(options.headers);
  const type = headers['content-type'] || '';

  // If body is already a string, then pass it through as-is.
  if (typeof options.data === 'string') {
    output.body = options.data;
  }
  // Build request initializers based off of content-type
  else if (type.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options.data || {})) {
      params.set(key, value as any);
    }
    output.body = params.toString();
  } else if (type.includes('multipart/form-data')) {
    const form = new FormData();
    if (options.data instanceof FormData) {
      options.data.forEach((value, key) => {
        form.append(key, value);
      });
    } else {
      for (let key of Object.keys(options.data)) {
        form.append(key, options.data[key]);
      }
    }
    output.body = form;
    const headers = new Headers(output.headers);
    headers.delete('content-type'); // content-type will be set by `window.fetch` to includy boundary
    output.headers = headers;
  } else if (
    type.includes('application/json') ||
    typeof options.data === 'object'
  ) {
    output.body = JSON.stringify(options.data);
  }

  return output;
};

/**
 * Perform an Http request given a set of options
 * @param options Options to build the HTTP request
 */
export const request = async (options: HttpOptions): Promise<HttpResponse> => {
  const requestInit = buildRequestInit(options, options.webFetchExtra);
  const urlParams = buildUrlParams(
    options.params,
    options.shouldEncodeUrlParams,
  );
  const url = urlParams ? `${options.url}?${urlParams}` : options.url;

  const response = await fetch(url, requestInit);
  const contentType = response.headers.get('content-type') || '';

  // Default to 'text' responseType so no parsing happens
  let { responseType = 'text' } = response.ok ? options : {};

  // If the response content-type is json, force the response to be json
  if (contentType.includes('application/json')) {
    responseType = 'json';
  }

  let data: any;
  switch (responseType) {
    case 'arraybuffer':
    case 'blob':
      const blob = await response.blob();
      data = await readBlobAsBase64(blob);
      break;
    case 'json':
      data = await response.json();
      break;
    case 'document':
    case 'text':
    default:
      data = await response.text();
  }

  // Convert fetch headers to Capacitor HttpHeaders
  const headers = {} as HttpHeaders;
  response.headers.forEach((value: string, key: string) => {
    headers[key] = value;
  });

  return {
    data,
    headers,
    status: response.status,
    url: response.url,
  };
};

/**
 * Perform an Http GET request given a set of options
 * @param options Options to build the HTTP request
 */
export const get = async (options: HttpOptions): Promise<HttpResponse> =>
  request({ ...options, method: 'GET' });

/**
 * Perform an Http POST request given a set of options
 * @param options Options to build the HTTP request
 */
export const post = async (options: HttpOptions): Promise<HttpResponse> =>
  request({ ...options, method: 'POST' });

/**
 * Perform an Http PUT request given a set of options
 * @param options Options to build the HTTP request
 */
export const put = async (options: HttpOptions): Promise<HttpResponse> =>
  request({ ...options, method: 'PUT' });

/**
 * Perform an Http PATCH request given a set of options
 * @param options Options to build the HTTP request
 */
export const patch = async (options: HttpOptions): Promise<HttpResponse> =>
  request({ ...options, method: 'PATCH' });

/**
 * Perform an Http DELETE request given a set of options
 * @param options Options to build the HTTP request
 */
export const del = async (options: HttpOptions): Promise<HttpResponse> =>
  request({ ...options, method: 'DELETE' });

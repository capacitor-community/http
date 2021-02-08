import * as Types from './definitions';

/**
 * Safely web encode a string value (inspired by js-cookie)
 * @param str The string value to encode
 */
const encode = (str: string) =>
  encodeURIComponent(str)
    .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
    .replace(/[()]/g, escape);

/**
 * Safely web decode a string value (inspired by js-cookie)
 * @param str The string value to decode
 */
const decode = (str: string): string =>
  str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);

/**
 * Set a cookie
 * @param key The key to set
 * @param value The value to set
 * @param options Optional additional parameters
 */
export const setCookie = (
  key: string,
  value: any,
  options: Types.HttpSetCookieOptions = {},
): void => {
  // Safely Encoded Key/Value
  const encodedKey = encode(key);
  const encodedValue = encode(value);

  let expires = options.expires || '';

  // Support options.ageDays, but convert to expires
  if (options.ageDays) {
    const date = new Date();
    date.setTime(date.getTime() + options.ageDays * 864e5);
    expires = date.toUTCString();
  }

  if (expires) {
    expires = `; expires=${expires.replace('expires=', '')}`;
  }

  document.cookie = `${encodedKey}=${encodedValue || ''}${
    options.expires
  }; path=/`;
};

/**
 * Gets all cookie values unless a key is specified, then return only that value
 * @param key The key of the cookie value to get
 */
export const getCookie = (key?: string): any => {
  const output: any = {};
  if (!document.cookie) {
    return output;
  }

  const cookies = document.cookie.split(';') || [];
  for (const cookie of cookies) {
    // Replace first "=" with CAP_COOKIE to prevent splitting on additional "="
    let [k, v] = cookie.replace(/=/, 'CAP_COOKIE').split('CAP_COOKIE');
    k = decode(k).trim();
    v = decode(v).trim();
    output[k] = v;

    if (k === key) {
      return v;
    }
  }

  return output;
};

/**
 * Deletes a cookie given a key
 * @param key The key of the cookie to delete
 */
export const deleteCookie = (key: string): void => {
  document.cookie = `${key}=; Max-Age=0`;
};

/**
 * Clears out cookies by setting them to expire immediately
 */
export const clearCookies = (): void => {
  const cookies = document.cookie.split(';') || [];
  for (const cookie of cookies) {
    document.cookie = cookie
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  }
};

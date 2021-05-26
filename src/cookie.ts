import { HttpCookie, HttpCookieOptions } from './definitions';
import { encode, decode } from './utils';

/**
 * Set a cookie
 * @param key The key to set
 * @param value The value to set
 * @param options Optional additional parameters
 */
export const setCookie = (
  key: string,
  value: any,
  options: HttpCookieOptions = {},
): void => {
  // Safely Encoded Key/Value
  const encodedKey = encode(key);
  const encodedValue = encode(value);

  // Clean & sanitize options
  const expires = `; expires=${(options.expires || '').replace(
    'expires=',
    '',
  )}`; // Default is "; expires="
  const path = (options.path || '/').replace('path=', ''); // Default is "path=/"

  document.cookie = `${encodedKey}=${
    encodedValue || ''
  }${expires}; path=${path}`;
};

/**
 * Gets all HttpCookies
 */
export const getCookies = (): HttpCookie[] => {
  const output: HttpCookie[] = [];
  const map: any = {};
  if (!document.cookie) {
    return output;
  }

  const cookies = document.cookie.split(';') || [];
  for (const cookie of cookies) {
    // Replace first "=" with CAP_COOKIE to prevent splitting on additional "="
    let [k, v] = cookie.replace(/=/, 'CAP_COOKIE').split('CAP_COOKIE');
    k = decode(k).trim();
    v = decode(v).trim();
    map[k] = v;
  }

  const entries: [string, any][] = Object.entries(map);
  for (const [key, value] of entries) {
    output.push({
      key,
      value,
    });
  }

  return output;
};

/**
 * Gets a single HttpCookie given a key
 */
export const getCookie = (key: string): HttpCookie => {
  const cookies = getCookies();
  for (const cookie of cookies) {
    if (cookie.key === key) {
      return cookie;
    }
  }

  return {
    key,
    value: '',
  };
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

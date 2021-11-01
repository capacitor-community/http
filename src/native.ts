import { Capacitor } from '@capacitor/core';
import type { HttpPlugin, HttpOptions } from './definitions';

type HttpNativePlugin = HttpPlugin & {
  __abortRequest(options: { abortCode: number }): Promise<void>;
};

export function nativeWrap(Http: HttpPlugin) {
  // Original proxy from the registerPlugin function
  const nativePlugin = Http as HttpNativePlugin;

  // Unique id counter for the abortion codes
  let abortCodeCounter = 0;

  const request = async (options: HttpOptions) => {
    if (options.signal) {
      if (Capacitor.getPlatform() === 'ios') {
        throw new Error('Cancelation is not implemented on iOS');
      }

      const { signal } = options;

      const abortCode = ++abortCodeCounter;

      // Action to perform when AbortController.abort is called
      const onAbort = () => {
        nativePlugin.__abortRequest({ abortCode });

        signal.removeEventListener('abort', onAbort);
      };

      signal.addEventListener('abort', onAbort);

      options = {
        ...options,
        // Since the original AbortSignal object is not serializable,
        // we need to create our own and add the `abortCode` property
        signal: {
          abortCode,
          aborted: signal.aborted,
        } as any,
      };
    }

    return nativePlugin.request(options);
  };

  const makeRequestFn = (method: string) => (options: HttpOptions) => {
    return request({
      ...options,
      method,
    });
  };

  const methods = ['get', 'post', 'put', 'patch', 'del'] as const;

  const requestFnsByMethod = methods.reduce((mapping, method) => {
    mapping[method] = makeRequestFn(method);

    return mapping;
  }, {} as Record<typeof methods[number], typeof request>);

  // Proxy wrapper around the original plugin object
  return new Proxy({} as HttpPlugin, {
    get(_, prop: keyof HttpNativePlugin) {
      switch (prop) {
        // By doing this, we prevent users from accessing this method
        case '__abortRequest':
          return undefined;

        case 'request':
          return request;

        case 'get':
        case 'post':
        case 'put':
        case 'patch':
        case 'del':
          return requestFnsByMethod[prop];

        default:
          return nativePlugin[prop];
      }
    },
  });
}

import { Capacitor } from '@capacitor/core';
import type { HttpPlugin, HttpOptions, HttpResponse } from './definitions';

interface HttpNativePlugin extends HttpPlugin {
  __abortRequest(options: { abortCode: number }): Promise<void>;
}

type RequestFn = HttpPlugin['request'];

export function nativeWrap(Http: HttpPlugin) {
  // Original proxy from the registerPlugin function
  const nativePlugin = Http as HttpNativePlugin;

  // Unique id counter for the abortion codes
  let abortCodeCounter = 0;

  const makeSignalProxy =
    (requestFn: RequestFn) => async (options: HttpOptions) => {
      if (!options.signal) {
        // If a signal is not passed, we can just call the default request function
        return requestFn(options);
      }

      if (Capacitor.getPlatform() === 'ios') {
        throw new Error('Request cancelation is not implemented on iOS');
      }

      const { signal } = options;

      const abortCode = ++abortCodeCounter;

      options = {
        ...options,
        // Since the original AbortSignal object is not serializable,
        // we need to create our own and add the `abortCode` property
        signal: {
          abortCode,
          aborted: signal.aborted,
        } as any,
      };

      const onAbort = () => nativePlugin.__abortRequest({ abortCode });

      signal.addEventListener('abort', onAbort);

      let response: HttpResponse;

      try {
        response = await requestFn(options);
      } finally {
        // The event listener must be removed regardless of the result
        signal.removeEventListener('abort', onAbort);
      }

      return response;
    };

  const requestFnsByMethod: Record<string, RequestFn> = {};

  // Proxy wrapper around the original plugin object
  return new Proxy({} as HttpPlugin, {
    get(_, prop: keyof HttpNativePlugin) {
      switch (prop) {
        // By doing this, we prevent users from accessing this method
        case '__abortRequest':
          return undefined;

        case 'request':
        case 'get':
        case 'post':
        case 'put':
        case 'patch':
        case 'del':
          return (requestFnsByMethod[prop] ||= makeSignalProxy(
            nativePlugin[prop],
          ));

        default:
          return nativePlugin[prop];
      }
    },
  });
}

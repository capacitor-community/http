import {
  RequestInfo,
  RequestInit as NodeFetchRequestInit,
  Response as NodeFetchResponse,
} from 'node-fetch';

import FinalizationRegistry from './finalizationregistry';

declare global {
  interface Window {
    CapacitorCustomPlatform?: {
      plugins: {
        Fetch?: {
          fetch(
            url: RequestInfo,
            init?: NodeFetchRequestInit,
          ): Promise<ReturnType>;
          getBlob(id: string): Promise<{ type: string; buffer: Buffer }>;
          getJson(id: string): Promise<Record<string, any>>;
          getBuffer(id: string): Promise<Buffer>;
          getText(id: string): Promise<string>;
          startBodyStream(id: string): Promise<void>;
          stopBodyStream(id: string): Promise<void>;
          dispose(id: string): void;

          addListener(event: string, callback: (...args: any) => void): string;
          removeListener(id: string): void;
        };
      };
    };
  }
}

export type ReturnType = NodeFetchResponse & {
  headers: { [k: string]: string };
  size: number;
  url: string;
  id: string;
};

export type Response = ReturnType & {
  json: () => Promise<Record<string, any>>;
  text: () => Promise<string>;
  blob: () => Promise<Blob>;
  dispose: () => void;
  headers: Headers;
  body: ReadableStream<Uint8Array>;
};

const finalizationRegistry =
  'FinalizationRegistry' in window
    ? new FinalizationRegistry(id =>
        window.CapacitorCustomPlatform?.plugins.Fetch?.dispose(id),
      )
    : undefined;

const electronFetch = (
  url: RequestInfo,
  init?: RequestInit,
): Promise<Response> => {
  if (!window.CapacitorCustomPlatform?.plugins?.Fetch) {
    throw new Error('CapacitorCustomPlatform.plugins.Fetch is not defined???');
  }

  const nodeFetchInit = init ? (init as NodeFetchRequestInit) : undefined;

  return window.CapacitorCustomPlatform.plugins.Fetch.fetch(
    url,
    nodeFetchInit,
  ).then((response: ReturnType): Response => {
    const { id, headers, ...responseData } = response;

    const webResponse = {
      ...responseData,
      headers: new Headers(headers),
      dispose: () => window.CapacitorCustomPlatform?.plugins.Fetch?.dispose(id),
      json: () => window.CapacitorCustomPlatform?.plugins.Fetch?.getJson(id),
      text: () => window.CapacitorCustomPlatform?.plugins.Fetch?.getText(id),
      blob: async (): Promise<Blob> => {
        const blobObj =
          await window.CapacitorCustomPlatform?.plugins.Fetch?.getBlob(id);

        if (!blobObj) {
          throw new Error(
            'CapacitorCustomPlatform.plugins.Fetch is not defined???',
          );
        }

        const { type, buffer } = blobObj;

        return new Blob([buffer], { type });
      },
    } as Response;

    const responseProxy = new Proxy<Response>(webResponse, {
      get(...args) {
        const [target, prop, receiver] = args;

        if (prop === 'body') {
          const entry = Reflect.get(target, prop);

          if (entry) {
            return entry;
          }

          let eventId: string | undefined;
          const stream = new ReadableStream<Uint8Array>({
            start(controller) {
              eventId =
                window.CapacitorCustomPlatform?.plugins.Fetch?.addListener(
                  `body-${id}`,
                  (eventType: 'close' | 'error' | 'data', data) => {
                    switch (eventType) {
                      case 'close':
                        controller.close();
                        break;
                      case 'error':
                        controller.error(data);
                        break;
                      case 'data':
                        controller.enqueue(data);
                        break;
                    }
                  },
                );
              window.CapacitorCustomPlatform?.plugins.Fetch?.startBodyStream(
                id,
              );
            },
            pull() {
              // Not needed
            },
            cancel: async () => {
              try {
                await window.CapacitorCustomPlatform?.plugins.Fetch?.stopBodyStream(
                  id,
                );
              } catch (err) {
                if (eventId) {
                  window.CapacitorCustomPlatform?.plugins.Fetch?.removeListener(
                    eventId,
                  );
                }

                throw err;
              }
            },
          });

          Reflect.set(target, prop, stream, receiver);

          return stream;
        }

        return Reflect.get(...args);
      },
    });

    // Dispose of the response on the Electron side when this object gets garbage collected
    finalizationRegistry?.register(responseProxy, id);

    return responseProxy;
  });
};

// @ts-ignore
export default window.CapacitorCustomPlatform?.plugins.Fetch
  ? electronFetch
  : undefined;

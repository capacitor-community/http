import {
  RequestInfo,
  RequestInit as NodeFetchRequestInit,
  Response as NodeFetchResponse,
} from 'node-fetch';

declare global {
  interface Window {
    CapacitorCustomPlatform: {
      plugins?: {
        Fetch: {
          fetch(
            url: RequestInfo,
            init?: NodeFetchRequestInit,
          ): Promise<ReturnType>;
          getBlob(id: string): Promise<{ type: string; buffer: Buffer }>;
          getJson(id: string): Promise<Record<string, any>>;
          getBuffer(id: string): Promise<Buffer>;
          getText(id: string): Promise<string>;
        };
      };
    };
  }
}

export type ReturnType = NodeFetchResponse & {
  headers: { [k: string]: string };
  url: string;
  id: string;
};

export type Response = ReturnType & {
  json: () => Promise<Record<string, any>>;
  text: () => Promise<string>;
  blob: () => Promise<Blob>;
  headers: Headers;
};

const electronFetch = (
  url: RequestInfo,
  init?: RequestInit,
): Promise<Response> => {
  if (!window.CapacitorCustomPlatform.plugins?.Fetch) {
    throw new Error('CapacitorCustomPlatform.plugins.Fetch is not defined???');
  }

  const nodeFetchInit = init ? (init as NodeFetchRequestInit) : undefined;

  return window.CapacitorCustomPlatform.plugins.Fetch.fetch(
    url,
    nodeFetchInit,
  ).then((response: ReturnType): Response => {
    const { id, headers, ...responseData } = response;

    return {
      ...responseData,
      headers: new Headers(headers),
      json: () => window.CapacitorCustomPlatform.plugins?.Fetch?.getJson(id),
      text: () => window.CapacitorCustomPlatform.plugins?.Fetch?.getText(id),
      blob: async (): Promise<Blob> => {
        const blobObj =
          await window.CapacitorCustomPlatform.plugins?.Fetch.getBlob(id);

        if (!blobObj) {
          throw new Error(
            'CapacitorCustomPlatform.plugins.Fetch is not defined???',
          );
        }

        const { type, buffer } = blobObj;

        return new Blob([buffer], { type });
      },
    } as Response;
  });
};

// @ts-ignore
export default window.CapacitorCustomPlatform.plugins?.Fetch
  ? electronFetch
  : undefined;

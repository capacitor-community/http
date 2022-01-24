import fetch, { Response, RequestInfo, RequestInit } from 'node-fetch';
import { EventEmitter } from 'stream';
import { randomBytes } from 'crypto';

type ReturnType = Response & {
  headers: { [k: string]: string };
  url: string;
  id: string;
};

interface BodyEvents {
  error: (error: Error) => void;
  data: (data: any) => void;
  close: () => void;
}

class FetchHelper extends EventEmitter {
  private static _responses = new Map<
    string,
    { response: Response; bodyEvents?: BodyEvents }
  >();

  async fetch(url: RequestInfo, init?: RequestInit): Promise<ReturnType> {
    const response = await fetch(url, init);

    return FetchHelper._cloneResponse(response);
  }

  async getBuffer(id: string): Promise<Buffer> {
    const response = await FetchHelper._getResponse(id);

    return response.response.buffer();
  }
  async getText(id: string): Promise<string> {
    const response = await FetchHelper._getResponse(id);

    return response.response.text();
  }
  async getJson(id: string): Promise<Record<string, any>> {
    const response = await FetchHelper._getResponse(id);

    return response.response.json();
  }
  async getBlob(id: string): Promise<{ type: string; buffer: Buffer }> {
    const response = await FetchHelper._getResponse(id);
    const blob = await response.response.blob();

    const buffer = Buffer.from(await blob.text(), 'utf-8');

    return {
      type: blob.type,
      buffer,
    };
  }

  async startBodyStream(id: string): Promise<void> {
    const response = await FetchHelper._getResponse(id, false);

    const eventHandlers: BodyEvents = {
      error: err => {
        this.emit(`body-${id}`, 'error', err);
      },
      data: data => {
        this.emit(`body-${id}`, 'data', data);
      },
      close: () => {
        this.emit(`body-${id}`, 'close');
        this.stopBodyStream(id);
      },
    };

    response.response.body.on('close', eventHandlers.close);
    response.response.body.on('error', eventHandlers.error);
    response.response.body.on('data', eventHandlers.data);

    response.bodyEvents = eventHandlers;
  }
  async stopBodyStream(id: string): Promise<void> {
    const response = await FetchHelper._getResponse(id);

    Object.entries(response.bodyEvents ?? {}).forEach(([key, value]) => {
      response.response.body.off(key, value);
    });
  }

  dispose(id: string): void {
    FetchHelper._dispose(id);
  }

  private static _cloneResponse(response: Response): ReturnType {
    const headers = Object.fromEntries([...response.headers.entries()]);
    const id = FetchHelper._id();

    FetchHelper._responses.set(id, { response, bodyEvents: undefined });

    return {
      ...response,

      redirected: response.redirected,
      statusText: response.statusText,
      status: response.status,
      url: response.url,
      ok: response.ok,
      headers,

      id,
    } as ReturnType;
  }

  private static _id() {
    return randomBytes(8).toString('hex');
  }

  private static _dispose(id: string): void {
    FetchHelper._responses.delete(id);
  }

  private static _getResponse(
    id: string,
    dispose = true,
  ): Promise<{ response: Response; bodyEvents?: BodyEvents }> {
    const response = FetchHelper._responses.get(id);

    if (dispose) {
      FetchHelper._dispose(id);
    }

    return response
      ? Promise.resolve(response)
      : Promise.reject(new Error(`Response not found for ID '${id}'`));
  }
}

export { FetchHelper as Fetch, ReturnType };

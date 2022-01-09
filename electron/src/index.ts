import fetch, { Response, RequestInfo, RequestInit } from 'node-fetch';
import { randomBytes } from 'crypto';

type ReturnType = Response & {
  headers: { [k: string]: string };
  url: string;
  id: string;
};

class FetchHelper {
  private static _responses = new Map<string, Response>();

  async fetch(url: RequestInfo, init?: RequestInit): Promise<ReturnType> {
    const response = await fetch(url, init);

    return FetchHelper._cloneResponse(response);
  }

  async getBuffer(id: string): Promise<Buffer> {
    const response = await FetchHelper._getResponse(id);

    return response.buffer();
  }
  async getText(id: string): Promise<string> {
    const response = await FetchHelper._getResponse(id);

    return response.text();
  }
  async getJson(id: string): Promise<Record<string, any>> {
    const response = await FetchHelper._getResponse(id);

    return response.json();
  }
  async getBlob(id: string): Promise<{ type: string; buffer: Buffer }> {
    const response = await FetchHelper._getResponse(id);
    const blob = await response.blob();

    const buffer = Buffer.from(await blob.text(), 'utf-8');

    return {
      type: blob.type,
      buffer,
    };
  }

  dispose(id: string): void {
    FetchHelper._responses.delete(id);
  }

  private static _cloneResponse(response: Response): ReturnType {
    const headers = Object.fromEntries([...response.headers.entries()]);
    const id = FetchHelper._id();

    FetchHelper._responses.set(id, response);

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

  private static _getResponse(id: string): Promise<Response> {
    const response = FetchHelper._responses.get(id);
    FetchHelper._responses.delete(id);

    return response
      ? Promise.resolve(response)
      : Promise.reject(new Error(`Response not found for ID '${id}'`));
  }
}

export { FetchHelper as Fetch, ReturnType };

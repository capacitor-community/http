import { Capacitor, registerPlugin } from '@capacitor/core';
import { nativeWrap } from './native';
import type { HttpPlugin } from './definitions';

let Http = registerPlugin<HttpPlugin>('Http', {
  web: () => import('./web').then(m => new m.HttpWeb()),
  electron: () => import('./web').then(m => new m.HttpWeb()),
});

if (Capacitor.isNativePlatform()) {
  Http = nativeWrap(Http);
}

export * from './definitions';
export { Http };

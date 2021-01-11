import { registerPlugin } from '@capacitor/core';
import type { HttpPlugin } from './definitions';

const Http = registerPlugin<HttpPlugin>('Http', {
  web: () => import('./web').then(m => new m.HttpPluginWeb()),
});

export * from './definitions';
export { Http };

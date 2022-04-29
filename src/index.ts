import { registerPlugin } from '@capacitor/core';

import type { HttpPlugin } from './definitions';
import electronFetch from './electronHelper';

const Http = registerPlugin<HttpPlugin>('Http', {
  web: () => import('./web').then(m => new m.HttpWeb()),
  electron: () => import('./web').then(m => new m.HttpWeb()),
});

export * from './definitions';
export { Http, electronFetch };

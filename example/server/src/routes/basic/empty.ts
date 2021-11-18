import Hapi from '@hapi/hapi';

// Hapi route collection returning an empty Http 204 for every standard route + 1 custom route (LINK)
const output = null;
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/',
    options: {
      cors: true,
    },
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      return output;
    },
  } as Hapi.ServerRoute;
});

export default routes;

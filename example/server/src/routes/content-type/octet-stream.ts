import Hapi from '@hapi/hapi';

// Hapi route collection returning a Buffer octet-stream for every standard route + 1 custom route (LINK)
const output = Buffer.from('Hello World');
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/content-type/octet',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      return output;
    },
  } as Hapi.ServerRoute;
});

export default routes;

import Hapi from '@hapi/hapi';

// Hapi route collection returning a JSON object with a text/plain header for every standard route + 1 custom route (LINK)
const output = { 'content-type': 'text/plain' };
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/content-type/plaintext',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      const response = toolkit.response(output);
      response.header('Content-Type', 'text/plain');
      return response;
    },
  } as Hapi.ServerRoute;
});

export default routes;

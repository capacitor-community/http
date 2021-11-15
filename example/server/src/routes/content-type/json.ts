import Hapi from '@hapi/hapi';

// Hapi route collection returning a JSON object for every standard route + 1 custom route (LINK)
const output = { 'content-type': 'application/json' };
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/content-type/json',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      const response = toolkit.response(output);
      response.header('Content-Type', 'application/json');
      return response;
    },
  } as Hapi.ServerRoute;
});

export default routes;

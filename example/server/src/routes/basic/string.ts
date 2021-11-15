import Hapi from '@hapi/hapi';

// Hapi route collection returning a string for every standard route + 1 custom route (LINK)
const output = 'String Http Response. This should not break things!';
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/string',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      return output;
    },
  } as Hapi.ServerRoute;
});

export default routes;

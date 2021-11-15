import Hapi from '@hapi/hapi';

// Hapi route collection returning a number for every standard route + 1 custom route (LINK)
const output = 200;
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/number',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      return output;
    },
  } as Hapi.ServerRoute;
});

export default routes;

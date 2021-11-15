import Hapi from '@hapi/hapi';

// Hapi route collection returning an image with an image/jpg header for every standard route + 1 custom route (LINK)
const output = { 'content-type': 'image/jpg' };
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/content-type/image',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      const response = toolkit.file(`${process.cwd()}/files/static/test.jpg`);
      response.header('Content-Type', 'image/jpg');
      return response;
    },
  } as Hapi.ServerRoute;
});

export default routes;

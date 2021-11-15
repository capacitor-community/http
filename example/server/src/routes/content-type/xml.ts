import Hapi from '@hapi/hapi';

// Hapi route collection returning an image with an application/zip header for every standard route + 1 custom route (LINK)
const output = { 'content-type': 'application/xml' };
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/content-type/xml',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      const response = toolkit.response('<Xml>Test XML</Xml>');
      response.header('Content-Type', 'application/xml');
      return response;
    },
  } as Hapi.ServerRoute;
});

export default routes;

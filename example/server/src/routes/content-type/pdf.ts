import Hapi from '@hapi/hapi';

// Hapi route collection returning a PDF with an application/pdf header for every standard route + 1 custom route (LINK)
const output = { 'content-type': 'text/pdf' };
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/content-type/pdf',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      const response = toolkit.file(`${process.cwd()}/files/static/test.pdf`);
      response.header('Content-Type', 'application/pdf');
      return response;
    },
  } as Hapi.ServerRoute;
});

export default routes;

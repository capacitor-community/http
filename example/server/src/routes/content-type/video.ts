import Hapi from '@hapi/hapi';

// Hapi route collection returning a video with an video/mp4 header for every standard route + 1 custom route (LINK)
const output = { 'content-type': 'video/mp4' };
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/content-type/video',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      const response = toolkit.file(`${process.cwd()}/files/static/test.mp4`);
      response.header('Content-Type', 'video/mp4');
      return response;
    },
  } as Hapi.ServerRoute;
});

export default routes;

import Hapi from '@hapi/hapi';
import FormData from 'form-data';

// Hapi route collection returning a multipart/form for every standard route + 1 custom route (LINK)
const output = { 'content-type': 'multipart/form-data' };
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/content-type/multipart-form',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      const form = new FormData();
      form.append('string', 'Hello World');
      form.append('number', 500);
      form.append('buffer', Buffer.from('foobar'));

      const response = toolkit.response(form.getBuffer());
      response.header('Content-Type', `multipart/form-data; boundary=${form.getBoundary()}`);
      return response;
    },
  } as Hapi.ServerRoute;
});

export default routes;

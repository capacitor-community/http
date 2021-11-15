import Hapi from '@hapi/hapi';

// Hapi route collection returning a JSON object for every standard route + 1 custom route (LINK)

const output = {
  'stringValue': 'string value',
  'numberValue': 1000,
  'booleanValue': true,
  'nullValue': null,
  'string-with-hyphen': 'string-hyphenated value',
  'nestedValue': {
    'stringValue': 'string value',
    'numberValue': 1000,
    'booleanValue': true,
    'nullValue': null,
    'string-with-hyphen': 'string-hyphenated value',
    'nestedValue': {
      'stringValue': 'string value',
      'numberValue': 1000,
      'booleanValue': true,
      'nullValue': null,
      'string-with-hyphen': 'string-hyphenated value',
    },
  },
};

const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'link'];

const routes: Hapi.ServerRoute[] = httpMethods.map<Hapi.ServerRoute>(method => {
  return {
    method,
    path: '/json',
    handler: (request: Hapi.Request, toolkit: Hapi.ResponseToolkit, err: Error) => {
      return output;
    },
  } as Hapi.ServerRoute;
});

export default routes;

import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import BasicRoutes from './routes/basic';
import ContentTypeRoutes from './routes/content-type';

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'], // an array of origins or 'ignore'
        credentials: true, // boolean - 'Access-Control-Allow-Credentials'
      },
    },
  });
  await server.register(Inert);

  server.route(BasicRoutes);
  server.route(ContentTypeRoutes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err: any) => {
  console.log(err);
  process.exit(1);
});

init();

/*
import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import path from 'path'

// __dirname workaround for .mjs file
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const upload = multer({ dest: 'uploads/' })

const staticPath = path.join(__dirname, '/public');

app.use(express.static(staticPath));
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.listen(3455, function () {
  console.log('listening on port 3455');
});

app.get('/get', (req, res) => {
  const headers = req.headers;
  const params = req.query;
  console.log('Got headers', headers);
  console.log('Got params', params);
  console.log(req.url);
  res.status(200);
  res.send();
});

app.get('/get-gzip', compression({ filter: (req, res) => true, threshold: 1,}), (req, res) => {
  const headers = req.headers;
  const params = req.query;
  console.log('Got headers', headers);
  console.log('Got params', params);
  console.log(req.url);
  res.status(200);
  res.json({
    data: 'compressed',
  });
});

app.get('/get-json', (req, res) => {
  res.status(200);
  res.json({
    name: 'Max',
    superpower: 'Being Awesome',
  });
});

app.get('/get-html', (req, res) => {
  res.status(200);
  res.header('Content-Type', 'text/html');
  res.send('<html><body><h1>Hi</h1></body></html>');
});

app.get('/head', (req, res) => {
  const headers = req.headers;
  console.log('HEAD');
  console.log('Got headers', headers);
  res.status(200);
  res.send();
});

app.delete('/delete', (req, res) => {
  const headers = req.headers;
  console.log('DELETE');
  console.log('Got headers', headers);
  res.status(200);
  res.send();
});

app.patch('/patch', (req, res) => {
  const headers = req.headers;
  console.log('PATCH');
  console.log('Got headers', headers);
  res.status(200);
  res.send();
});

app.post('/post', (req, res) => {
  const headers = req.headers;
  console.log('POST');
  console.log('Got headers', headers);
  res.status(200);
  res.send();
});

app.put('/put', (req, res) => {
  const headers = req.headers;
  console.log('PUT');
  console.log('Got headers', headers);
  res.status(200);
  res.send();
});

app.get('/cookie', (req, res) => {
  console.log('COOKIE', req.cookies);
  res.status(200);
  res.send();
});

app.get('/download-pdf', (req, res) => {
  console.log('Sending PDF to request', +new Date());
  res.download('document.pdf');
});

app.get('/set-cookies', (req, res) => {
  res.cookie('style', 'very cool');
  res.send();
});

app.post('/upload-pdf', upload.single('myFile'), (req, res) => {
  console.log('Handling upload');
  const file = req.file;
  console.log('Got file', file);

  res.status(200);
  res.send();
});

app.post('/form-data', (req, res) => {
  console.log('Got form data post', req.body);

  res.status(200);
  res.send();
});

app.post('/form-data-multi', upload.any(), (req, res) => {
  console.log('Got form data multipart post', req.body);

  console.log(req.files);

  res.status(200);
  res.send();
});
*/

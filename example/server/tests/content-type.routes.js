// tests/demo.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import axios from 'axios';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'LINK'];

test('Is server running?', async () => {
  try {
    await axios.get('http://localhost:3000');
  } catch (err) {
    assert.unreachable('Error! Is the example server running?');
  }
});

test('Content-Type -> Images', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/content-type/image', responseType: 'blob' });

    // Image request should return 200 with an image and proper headers
    assert.is(res.status, 200); // Http 200 - OK
    assert.is(res.headers['content-type'], 'image/jpg'); // Content-Type specifies image
    assert.ok(res.data); // Just check if it is a non-empty body
  }
});

test('Content-Type -> JSON', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/content-type/json' });

    // JSON request should return 200 with parsed json and proper headers
    assert.is(res.status, 200); // Http 200 - OK
    assert.is(res.headers['content-type'], 'application/json; charset=utf-8'); // Content-Type specifies json
    assert.type(res.data, 'object'); // res.data['content-type'] should be parsed json
    assert.is(res.data['content-type'], 'application/json'); // res.data['content-type'] should be what we expect
  }
});

test('Content-Type -> Multipart Form', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/content-type/multipart-form' });

    // Form request should return 200 with multipart form data and proper headers
    assert.is(res.status, 200); // Http 200 - OK
    assert.match(res.headers['content-type'], /multipart\/form-data; boundary/g); // Content-Type specifies multipart-form

    assert.type(res.data, 'string'); // res.data['content-type'] should a string that we'll match a bit
    assert.match(res.data, /Content-Disposition: form-data; name="string"/g);
    assert.match(res.data, /Content-Disposition: form-data; name="number"/g);
    assert.match(res.data, /Content-Disposition: form-data; name="buffer"/g);
    assert.match(res.data, /Content-Type: application\/octet-stream/g);
  }
});

test('Content-Type -> Octet Stream', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/content-type/octet', responseType: 'arraybuffer' });

    // Octet request should return 200 with a blob of data and proper headers
    assert.is(res.status, 200); // Http 200 - OK
    assert.is(res.headers['content-type'], 'application/octet-stream'); // Content-Type specifies octet-stream

    // Response should be a buffer (based on response type so axios doesn't auto-parse it)
    assert.type(res.data, 'object');

    // Convert buffer to string to make sure its what we expect
    const bufferString = res.data.toString();
    assert.is(bufferString, 'Hello World');
  }
});

test('Content-Type -> PDF', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/content-type/pdf', responseType: 'blob' });

    // PDF request should return 200 with a pdf and proper headers
    assert.is(res.status, 200); // Http 200 - OK
    assert.is(res.headers['content-type'], 'application/pdf'); // Content-Type specifies PDF
    assert.ok(res.data); // Just check if it is a non-empty body
  }
});

test('Content-Type -> Plain Text', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/content-type/plaintext' });

    // re-stringify data because axios parses it automatically without some hacks
    res.data = JSON.stringify(res.data);

    // JSON request should return 200 with a blob of data and proper headers
    assert.is(res.status, 200); // Http 200 - OK
    assert.is(res.headers['content-type'], 'text/plain; charset=utf-8'); // Content-Type specifies plaintext

    // Response should be a raw string
    assert.type(res.data, 'string');

    // Convert string to JSON to make sure its what we expect
    const json = JSON.parse(res.data);
    assert.match(json['content-type'], 'text/plain');
  }
});

test('Content-Type -> Video', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/content-type/video', responseType: 'blob' });

    // Video request should return 200 with a video and proper headers
    assert.is(res.status, 200); // Http 200 - OK
    assert.is(res.headers['content-type'], 'video/mp4'); // Content-Type specifies video file
    assert.ok(res.data); // Just check if it is a non-empty body
  }
});

test('Content-Type -> XML', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/content-type/xml' });

    // XML request should return 200 with proper XML and proper headers
    assert.is(res.status, 200); // Http 200 - OK
    assert.is(res.headers['content-type'], 'application/xml'); // Content-Type specifies xml
    assert.type(res.data, 'string');
    assert.is(res.data, '<Xml>Test XML</Xml>');
  }
});

test('Content-Type -> ZIP', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/content-type/zip', responseType: 'blob' });

    // Zip request should return 200 with a zip and proper headers
    assert.is(res.status, 200); // Http 200 - OK
    assert.is(res.headers['content-type'], 'application/zip'); // Content-Type specifies zip
    assert.ok(res.data); // Just check if it is a non-empty body
  }
});

test.run();

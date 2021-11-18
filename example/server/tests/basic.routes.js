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

test('Basic Routes', async () => {
  for (const i in methods) {
    const method = methods[i];
    const res = await axios.request({ method, url: 'http://localhost:3000/' });

    // Empty requests should be fairly bare
    assert.is(res.status, 204); // Http 204 - No Content
    assert.not.ok(res.data); // Body should be empty
  }
});

test.run();

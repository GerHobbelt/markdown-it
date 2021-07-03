
import supertest from 'supertest';
import child_process from 'child_process';

import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));


describe('babelmark responder app', function () {
  let app;

  const PORT    = 5005;
  const request = supertest('http://127.0.0.1:' + PORT);

  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  before(async () => {
    app = child_process.execFile(
      'node',
      [ '../support/babelmark-responder.js' ],
      {
        cwd: __dirname,
        env: Object.assign({}, process.env, { PORT: PORT })
      }
    );

    // Wait until app bind port
    for (let i = 0; i < 50; i++) {
      try {
        await request.get('/').expect(200);
        break;
      } catch (e) {  /* ignore */ }
      await timeout(100);
    }
  });


  it('ping root', async () => {
    return request
      .get('/')
      .expect(200)
      .expect(/<!DOCTYPE html>/i);
  });


  it('do request', async () => {
    return request
      .get('/?text=foo')
      .expect(200)
      .expect({
        html: '<p>foo</p>\n',
        name: 'markdown-it',
        version: packageJson.version
      });
  });


  after(() => {
    if (app) app.kill();
  });
});

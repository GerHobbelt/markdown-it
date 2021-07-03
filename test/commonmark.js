


import p from 'path';
import markdownItTestgen from '@gerhobbelt/markdown-it-testgen';
import assert from 'assert';
import MarkdownIt from '../index.js';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = p.dirname(__filename);

const load = markdownItTestgen.load;


function generate(path, md) {
  load(path, function (data) {
    data.meta = data.meta || {};

    const desc = data.meta.desc || p.relative(path, data.file);

    (data.meta.skip ? describe.skip : describe)(desc, function () {
      data.fixtures.forEach(function (fixture) {
        it(fixture.header ? fixture.header : 'line ' + (fixture.first.range[0] - 1), function () {
          assert.strictEqual(md.render(fixture.first.text), fixture.second.text);
        });
      });
    });
  });
}


describe('CommonMark', function () {
  const md = MarkdownIt('commonmark');

  generate(p.join(__dirname, 'fixtures/commonmark/good.txt'), md);
});




import path from 'path';

import generate from '@gerhobbelt/markdown-it-testgen';
import { MarkdownIt } from '../index.js';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


describe('markdown-it', function () {
  const md = MarkdownIt({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true,
    highSecurity: false
  });

  generate(path.join(__dirname, 'fixtures/markdown-it'), md);
});

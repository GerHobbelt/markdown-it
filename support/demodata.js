#!/usr/bin/env node

// Build demo data for embedding into html

/*eslint-disable no-console*/


import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));


console.log(JSON.stringify({
  self: {
    demo: {
      source: fs.readFileSync(path.join(__dirname, './demo_template/sample.md'), 'utf8')
    }
  }
}, null, 2));

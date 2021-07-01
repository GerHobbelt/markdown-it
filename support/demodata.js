#!/usr/bin/env node

// Build demo data for embedding into html

/*eslint-disable no-console*/


const fs   = require('fs');
const path = require('path');

console.log(JSON.stringify({
  self: {
    demo: {
      source: fs.readFileSync(path.join(__dirname, './demo_template/sample.md'), 'utf8')
    }
  }
}, null, 2));

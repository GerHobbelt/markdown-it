
const path = require('path');

const generate = require('@gerhobbelt/markdown-it-testgen');


describe('markdown-it', function () {
  const md = require('../')({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true,
    highSecurity: false
  });

  generate(path.join(__dirname, 'fixtures/markdown-it'), md);
});

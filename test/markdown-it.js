'use strict';


var path = require('path');


var generate = require('@gerhobbelt/markdown-it-testgen');


describe('markdown-it', function () {
  var md = require('../')({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true
  });

  generate(path.join(__dirname, 'fixtures/markdown-it'), md);
});

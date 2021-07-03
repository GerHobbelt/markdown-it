#!/usr/bin/env node
/*eslint no-console:0*/

// Fixtures generator from commonmark specs. Split spec to working / not working
// examples, or show total stat.




import fs from 'fs';
import path from 'path';
import util from 'util';
import argparse from 'argparse';

import { MarkdownIt as md } from '../lib/index.js';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const cli = new argparse.ArgumentParser({
  add_help: true
});

cli.add_argument('type', {
  help: 'type of examples to filter',
  nargs: '?',
  choices: [ 'good', 'bad' ]
});

cli.add_argument('-s', '--spec', {
  help: 'spec file to read',
  'default': path.join(__dirname, '../test/fixtures/commonmark/spec.txt')
});

cli.add_argument('-o', '--output', {
  help: 'output file, stdout if not set',
  'default': '-'
});

const options = cli.parse_args();

////////////////////////////////////////////////////////////////////////////////

function normalize(text) {
  return text.replace(/<blockquote>\n<\/blockquote>/g, '<blockquote></blockquote>');
}

////////////////////////////////////////////////////////////////////////////////

function readFile(filename, encoding, callback) {
  if (options.file === '-') {
    // read from stdin

    const chunks = [];

    process.stdin.on('data', function (chunk) {
      chunks.push(chunk);
    });

    process.stdin.on('end', function () {
      return callback(null, Buffer.concat(chunks).toString(encoding));
    });
  } else {
    fs.readFile(filename, encoding, callback);
  }
}


////////////////////////////////////////////////////////////////////////////////

readFile(options.spec, 'utf8', function (error, input) {
  const good = [], bad = [],
        markdown = md('commonmark');

  if (error) {
    if (error.code === 'ENOENT') {
      process.stderr.write('File not found: ' + options.spec);
      process.exit(2);
    }

    process.stderr.write(error.stack || error.message || String(error));
    process.exit(1);
  }

  input = input.replace(/→/g, '\t');

  markdown.parse(input, {})
    .filter(function (token) {
      return token.tag === 'code' &&
             token.info.trim() === 'example';
    })
    .forEach(function (token) {
      const arr  = token.content.split(/^\.\s*?$/m, 2);
      const md   = arr[0];
      const html = arr[1].replace(/^\n/, '');

      const result = {
        md:   md,
        html: html,
        line: token.map[0],
        err:  ''
      };

      try {
        if (markdown.render(md) === normalize(html)) {
          good.push(result);
        } else {
          result.err = markdown.render(md);
          bad.push(result);
        }
      } catch (___) {
        bad.push(result);
        throw ___;
      }
    });

  const out = [];

  if (!options.type) {
    out.push(util.format('CM spec stat: passed samples - %s, failed samples - %s', good.length, bad.length));
  } else {
    const data = options.type === 'good' ? good : bad;

    data.forEach(function (sample) {
      out.push(util.format(
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
        'src line: %s\n\n.\n%s.\n%s.\n',
        sample.line, sample.md, sample.html));
      if (sample.err) {
        out.push(util.format('error:\n\n%s\n', sample.err));
      }
    });
  }

  if (options.output !== '-') fs.writeFileSync(options.output, out.join('\n'));
  else console.log(out.join('\n'));

  process.exit(0);
});

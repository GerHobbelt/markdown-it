#!/usr/bin/env node
/*eslint no-console:0*/


import fs from "fs";
import path from 'path';
import argparse from "argparse";

import MarkdownIt from "../dist/markdown-it.mjs";

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));


////////////////////////////////////////////////////////////////////////////////

const cli = new argparse.ArgumentParser({
  prog: 'markdown-it',
  add_help: true
});

cli.add_argument('-v', '--version', {
  action: 'version',
    version: packageJson.version
});

cli.add_argument('--no-html', {
  help:   'Disable embedded HTML',
  action: 'store_true'
});

cli.add_argument('-l', '--linkify', {
  help:   'Autolink text',
  action: 'store_true'
});

cli.add_argument('-p', '--plugins', {
  help: 'List of plugin package names to include (e.g. markdown-it-footnote). Assumes plugins have been installed already.',
  action: 'append',
  nargs: '+'
});

cli.add_argument('-t', '--typographer', {
  help:   'Enable smartquotes and other typographic replacements',
  action: 'store_true'
});

cli.add_argument('--trace', {
  help:   'Show stack trace on error',
  action: 'store_true'
});

cli.add_argument('file', {
  help: 'File to read',
  nargs: '?',
  'default': '-'
});

cli.add_argument('-o', '--output', {
  help: 'File to write',
  'default': '-'
});

const options = cli.parse_args();


function readFile(filename, encoding, callback) {
  if (options.file === '-') {
    // read from stdin
    const chunks = [];

    process.stdin.on('data', function (chunk) { chunks.push(chunk); });

    process.stdin.on('end', function () {
      return callback(null, Buffer.concat(chunks).toString(encoding));
    });
  } else {
    fs.readFile(filename, encoding, callback);
  }
}

async function loadPlugins(md, plugins) {
  // Flatten array of plugins or arrays of plugins and load them.
  plugins = [].concat.apply([], plugins);

  for (let index = 0; index < plugins.length; ++index) {
    const name = plugins[index];

    try {
      const plugin = await import(name);
      md.use(plugin.default || plugin);
    } catch (e) {
      console.error('cannot load plugin ' + name);
    }
  }
}
////////////////////////////////////////////////////////////////////////////////

readFile(options.file, 'utf8', async function (err, input) {
  let output, md;

  if (err) {
    if (err.code === 'ENOENT') {
      console.error('File not found: ' + options.file);
      process.exit(2);
    }

    console.error(
      options.trace && err.stack ||
      err.message ||
      String(err));

    process.exit(1);
  }

  md = MarkdownIt({
    html: !options.no_html,
    xhtmlOut: false,
    typographer: options.typographer,
    linkify: options.linkify
  });

  if (options.plugins) {
    await loadPlugins(md, options.plugins);
  }

  try {
    output = md.render(input);

  } catch (e) {
    console.error(
      options.trace && e.stack ||
      e.message ||
      String(e));

    process.exit(1);
  }

  if (options.output === '-') {
    // write to stdout
    process.stdout.write(output);
  } else {
    fs.writeFileSync(options.output, output);
  }
});

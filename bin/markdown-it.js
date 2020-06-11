#!/usr/bin/env node
/*eslint no-console:0*/

'use strict';


let fs = require('fs');
let argparse = require('argparse');


////////////////////////////////////////////////////////////////////////////////

let cli = new argparse.ArgumentParser({
  prog: 'markdown-it',
  version: require('../package.json').version,
  addHelp: true
});

cli.addArgument([ '--no-html' ], {
  help:   'Disable embedded HTML',
  action: 'storeTrue'
});

cli.addArgument([ '-l', '--linkify' ], {
  help:   'Autolink text',
  action: 'storeTrue'
});

cli.addArgument([ '-t', '--typographer' ], {
  help:   'Enable smartquotes and other typographic replacements',
  action: 'storeTrue'
});

cli.addArgument([ '--trace' ], {
  help:   'Show stack trace on error',
  action: 'storeTrue'
});

cli.addArgument([ 'file' ], {
  help: 'File to read',
  nargs: '?',
  defaultValue: '-'
});

cli.addArgument([ '-o', '--output' ], {
  help: 'File to write',
  defaultValue: '-'
});

cli.addArgument([ '-p', '--plugin' ], {
  help: 'Load an optional plugin. Use multiple times for more than one plugin. Assumes PLUGIN has been installed already.',
  action: 'append'
});

let options = cli.parseArgs();


function readFile(filename, encoding, callback) {
  if (options.file === '-') {
    // read from stdin
    let chunks = [];

    process.stdin.on('data', function (chunk) { chunks.push(chunk); });

    process.stdin.on('end', function () {
      return callback(null, Buffer.concat(chunks).toString(encoding));
    });
  } else {
    fs.readFile(filename, encoding, callback);
  }
}


////////////////////////////////////////////////////////////////////////////////

readFile(options.file, 'utf8', function (err, input) {
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

  md = require('..')({
    html: !options.no_html,
    xhtmlOut: false,
    typographer: options.typographer,
    linkify: options.linkify
  });

  if (options.plugin) {
    options.plugin.forEach(function (pluginName) {
      let plugin = require(pluginName);
      md.use(plugin.default || plugin);
    });
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

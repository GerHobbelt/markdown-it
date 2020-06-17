#!/usr/bin/env node
/*eslint no-console:0*/




let fs = require('fs');
let argparse = require('argparse');


////////////////////////////////////////////////////////////////////////////////

let cli = new argparse.ArgumentParser({
  prog: 'markdown-it.js',
  version: require('../package.json').version,
  addHelp: true
});

cli.addArgument([ 'file' ], {
  help: 'File to read',
  nargs: '?',
  defaultValue: '-'
});

let options = cli.parseArgs();


function readFile(filename, encoding, callback) {
  if (options.file === '-') {
    // read from stdin

    let chunks = [];

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

readFile(options.file, 'utf8', function (err, input) {
  let output, md;

  if (err) {
    if (err.code === 'ENOENT') {
      console.error('File not found: ' + options.file);
      process.exit(2);
    }

    console.error(err.stack || err.message || String(err));

    process.exit(1);
  }

  md = require('..')({
    html: true,
    xhtmlOut: true,
    typographer: true,
    linkify: true,
    highSecurity: false
  });

  try {
    output = md.render(input);
  } catch (e) {
    console.error(e.stack || e.message || String(e));

    process.exit(1);
  }

  process.stdout.write(output);

  process.exit(0);
});

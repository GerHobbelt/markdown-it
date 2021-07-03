#!/usr/bin/env node

/* eslint no-console:0 */

const argparse = require('argparse');
const hdr = require('./header.js');

function help() {
  console.error(`
getGlobalName [choice]

Type of name/string to produce.

Choices:
  global, package, version, license, microbundle

`);
}

function print(msg) {
  process.stdout.write(msg);
}

  ////////////////////////////////////////////////////////////////////////////////

switch (process.argv[2]) {
default:
  help();
  process.exit(1);
  break;

case 'version':
  print(hdr.version);
  process.exit(0);
  break;

case 'package':
  print(hdr.packageName);
  process.exit(0);
  break;

case 'global':
  print(hdr.globalName);
  process.exit(0);
  break;

case 'microbundle':
  print(hdr.safeVariableName);
  process.exit(0);
  break;

case 'license':
  print(hdr.license);
  process.exit(0);
  break;
}


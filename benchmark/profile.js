#!/usr/bin/env node
/* eslint no-console:0 no-bitwise:0 */


const fs = require('fs');
const path = require('path');
const Benchmark = require('benchmark');
const microtime = require('microtime');

// see if user specifieed a number of seconds to run:
const arg = process.argv[process.argv.length - 1];
const maxSeconds = Number.parseFloat(arg);

console.log(`Start profile run (duration >= ${maxSeconds ? maxSeconds : '???'} seconds)`);

let output;

const t0 = microtime.nowDouble();

const md = require('../')({
  html: true,
  linkify: false,
  typographer: false
});

// var data = fs.readFileSync(path.join(__dirname, '/samples/lorem1.txt'), 'utf8');
const data = fs.readFileSync(path.join(__dirname, '../test/fixtures/commonmark/spec.txt'), 'utf8');

let tdelta;
do {
  for (let i = 0; i < 20; i++) {
    output = md.render(data);
  }

  const t1 = microtime.nowDouble();

  tdelta = t1 - t0;
} while (tdelta < maxSeconds);

const tsec = tdelta | 0;
tdelta = (tdelta - tsec) * 1000;
const tmsec = tdelta | 0;
tdelta = (tdelta - tmsec) * 1000;
const tusec = Math.round(tdelta);

console.log(`Total time taken for the run is ${tsec} seconds, ${tmsec} ms and ${tusec} us.`);

console.log('Test Finished.');


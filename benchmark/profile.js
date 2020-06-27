#!/usr/bin/env node
/*eslint no-console:0*/


let fs = require('fs');
let path = require('path');
var Benchmark = require('benchmark');
var microtime = require('microtime');

// see if user specifieed a number of seconds to run:
let arg = process.argv[process.argv.length - 1];
let maxSeconds = Number.parseFloat(arg);

console.log(`Start profile run (duration >= ${maxSeconds ? maxSeconds : '???'} seconds)`);

let output;

let t0 = microtime.nowDouble();

let md = require('../')({
  html: true,
  linkify: false,
  typographer: false
});

// var data = fs.readFileSync(path.join(__dirname, '/samples/lorem1.txt'), 'utf8');
let data = fs.readFileSync(path.join(__dirname, '../test/fixtures/commonmark/spec.txt'), 'utf8');

let tdelta;
do {
for (let i = 0; i < 20; i++) {
  output = md.render(data);
}

let t1 = microtime.nowDouble();

tdelta = t1 - t0;
} while (tdelta < maxSeconds);

let tsec = tdelta | 0;
tdelta = (tdelta - tsec) * 1000;
let tmsec = tdelta | 0;
tdelta = (tdelta - tmsec) * 1000;
let tusec = Math.round(tdelta);

  console.log(`Total time taken for the run is ${tsec} seconds, ${tmsec} ms and ${tusec} us.`);

console.log('Test Finished.');


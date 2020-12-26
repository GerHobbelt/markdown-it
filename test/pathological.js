/* eslint-disable no-unused-vars, no-bitwise, max-len, max-nested-callbacks */
'use strict';


const needle = require('needle');
const assert = require('assert');
const crypto = require('crypto');
const Worker = require('jest-worker').default;
const marky = require('marky');
const chalk = require('chalk');


async function test_pattern(func) {
  let result;

  let n = 500;
  let total_time_spent = 0;
  let dt = 0;
  let last_good_n = 0;
  let last_good_dt = 0;
  let mode = 1;          // 1: run up to promise timeout: limit; 2: iterate to find the 'just within' N value
  let rounds = 0;
  let errcnt = 0;
  let terminate_reason = 'total time spent reached limit';
  let err;
  let spinner = {
    __frames: [
      '⢹',
      '⢺',
      '⢼',
      '⣸',
      '⣇',
      '⡧',
      '⡗',
      '⡏'
    ],
    __pos: 0,
    __handle: null,
    frame: function getSpinner() {
      let c = this.__frames[this.__pos++];
      if (!c) {
        this.__pos = 0;
        c = this.__frames[this.__pos++];
      }

      // and start the spinner, if it isn't running yet:
      if (!this.__handle) this.start();
      return ' ' + chalk.yellow(c);
    },
    start: function startSpinner() {
      this.__handle = setInterval(() => {
        process.stdout.write(`${spinner.frame()}\r`);
      }, 80);
    },
    end: function endSpinner() {
      clearInterval(this.__handle);
      this.__handle = null;
    }
  };

  const TIME_LIMIT = 1000;
  while (total_time_spent < 10 * TIME_LIMIT) {
    const worker = new Worker(require.resolve('./pathological_worker.js'), {
      numWorkers: 1,
      enableWorkerThreads: true
    });

    marky.mark('pathological_test');
    rounds++;

    err = null;
    try {
      result = await Promise.race([
        worker.render(func(n)),

        new Promise(function (resolve, reject) {
          setTimeout(() => { reject(new Error('Terminated (timeout exceeded)')); }, TIME_LIMIT);
        })
      ]);
    } catch (ex) {
      err = ex;
    } finally {
      await worker.end();
    }

    let entry = marky.stop('pathological_test');
    dt = entry.duration;
    total_time_spent += dt;

    if (err) errcnt++;

    process.stdout.write(`${spinner.frame()} N=${n}, dt=${Math.round(dt)}ms, err:${err ? 'Y' : '-'}, mode=${mode}  \r`);

    // rough heuristic to quickly find the limit, whether or not the underlying algo is exponential
    if (mode === 1) {
      if (err) {
        mode = 2;
      } else {
        last_good_dt = dt;
        last_good_n = n;

        if (n >= 1E9) {
          terminate_reason = 'upper reasonable limit of N reached';
          break;
        }

        // when the duration of the 'last-known-good' is within 25% of the maximum, we stop the search to save time:
        if (dt > 0.25 * TIME_LIMIT) {
          terminate_reason = 'within 25% of time limit';
          break;
        }

        // guestimate next N to try:
        let rc = n / Math.max(1, dt - 20);
        n = Math.min(Math.max(n * 2, TIME_LIMIT * rc), 1E9);
      }
    }
    if (mode === 2) {
      if (err) {
        // current N is too much. Assume exponential behavior so estimate next N far below the half-way mark:
        let dn = n - last_good_n;
        // when the distance between 'last-known-good' and 'bad' gets below
        // a certain threshold (bad is within 15% of last-known-good),
        // we stop the search to save time:
        if (last_good_n && dn <= 0.15 * last_good_n) {
          terminate_reason = 'within 15% of last good N';
          break;
        }

        n = last_good_n + dn * 0.35 + 1;
      } else {
        last_good_dt = dt;
        last_good_n = n;

        // when the duration of the 'last-known-good' is within 33% of the maximum, we stop the search to save time:
        if (dt > 0.33 * TIME_LIMIT) {
          terminate_reason = 'within 33% of time limit';
          break;
        }
        n += 0.25 * last_good_n;
      }
    }
    // convert n to integer
    n |= 0;
  }

  spinner.end();
  
  //process.stdout.write(`            N=${last_good_n} (duration: ${Math.round(last_good_dt)}ms, rounds: ${rounds}, mode: ${mode}, errCnt: ${errcnt}, exit resaon: ${terminate_reason})\n`);

  // clearly mark potentially exponential pathological tests by printing their N 'depth' in white:
  if (last_good_n < 20000) {
    process.stdout.write(`            N = ${last_good_n}                           \n`);
  } else {
    process.stdout.write(chalk.grey(`            N = ${last_good_n}                           \n`));
  }

  return result;
}


describe('Pathological sequences speed', () => {

  it('Integrity check', async () => {
    assert.strictEqual(
      await test_pattern(() => 'foo'),
      '<p>foo</p>\n'
    );
  });

  // Ported from cmark, https://github.com/commonmark/cmark/blob/master/test/pathological_tests.py
  describe('Cmark', () => {

    it('verify original source crc', async () => {
      /* eslint-disable  max-len */
      const src = await needle('get', 'https://raw.githubusercontent.com/commonmark/cmark/master/test/pathological_tests.py');
      const src_md5 = crypto.createHash('md5').update(src.body).digest('hex');

      assert.strictEqual(
        src_md5,
        require('./pathological.json').md5,
        'CRC or cmark pathological tests hanged. Verify and update pathological.json'
      );
    });

    it('nested strong emph', async () => {
      await test_pattern((n) => '*a **a '.repeat(n) + 'b' + ' a** a*'.repeat(n));
    });

    it('many emph closers with no openers', async () => {
      await test_pattern((n) => 'a_ '.repeat(n));
    });

    it('many emph openers with no closers', async () => {
      await test_pattern((n) => '_a '.repeat(n));
    });

    it('many link closers with no openers', async () => {
      await test_pattern((n) => 'a]'.repeat(n));
    });

    it('many link openers with no closers', async () => {
      await test_pattern((n) => '[a'.repeat(n));
    });

    it('mismatched openers and closers', async () => {
      await test_pattern((n) => '*a_ '.repeat(n));
    });

    it('openers and closers multiple of 3', async () => {
      await test_pattern((n) => 'a**b' + ('c* '.repeat(n)));
    });

    it('link openers and emph closers', async () => {
      await test_pattern((n) => '[ a_'.repeat(n));
    });

    it('pattern [ (]( repeated', async () => {
      await test_pattern((n) => '[ (]('.repeat(n));
    });

    it('nested brackets', async () => {
      await test_pattern((n) => '['.repeat(n) + 'a' + ']'.repeat(n));
    });

    it('nested block quotes', async () => {
      await test_pattern((n) => '> '.repeat(n) + 'a');
    });

    it('deeply nested lists', async () => {
      await test_pattern((n) => Array(n).fill(0).map(function (_, x) { return '  '.repeat(x) + '* a\n'; }).join(''));
    });

    it('backticks', async () => {
      await test_pattern((n) => Array(n).fill(0).map(function (_, x) { return 'e' + '`'.repeat(x); }).join(''));
    });

    it('unclosed links A', async () => {
      await test_pattern((n) => '[a](<b'.repeat(n));
    });

    it('unclosed links B', async () => {
      await test_pattern((n) => '[a](b'.repeat(n));
    });
  });

  describe('Markdown-it', () => {
    it('emphasis **_* pattern', async () => {
      await test_pattern((n) => '**_* '.repeat(n));
    });

    it('backtick ``\\``\\`` pattern', async () => {
      await test_pattern((n) => '``\\'.repeat(n));
    });

    it('autolinks <<<<...<<> pattern', async () => {
      await test_pattern((n) => '<'.repeat(n) + '>');
    });
  });
});

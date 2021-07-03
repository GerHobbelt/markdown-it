


import assert from 'assert';
import { fromCodePoint } from '../lib/common/utils.js';
import { isValidEntityCode } from '../lib/common/utils.js';
import { assign } from '../lib/common/utils.js';
import { escapeRE } from '../lib/common/utils.js';
import { isWhiteSpace } from '../lib/common/utils.js';
import { isMdAsciiPunct } from '../lib/common/utils.js';
import { unescapeMd } from '../lib/common/utils.js';


describe('Utils', function () {

  it('fromCodePoint', function () {
    assert.strictEqual(fromCodePoint(0x20), ' ');
    assert.strictEqual(fromCodePoint(0x1F601), '😁');
  });

  it('isValidEntityCode', function () {
    assert.strictEqual(isValidEntityCode(0x20), true);
    assert.strictEqual(isValidEntityCode(0xD800), false);
    assert.strictEqual(isValidEntityCode(0xFDD0), false);
    assert.strictEqual(isValidEntityCode(0x1FFFF), false);
    assert.strictEqual(isValidEntityCode(0x1FFFE), false);
    assert.strictEqual(isValidEntityCode(0x00), false);
    assert.strictEqual(isValidEntityCode(0x0B), false);
    assert.strictEqual(isValidEntityCode(0x0E), false);
    assert.strictEqual(isValidEntityCode(0x7F), false);
  });

  /*it('replaceEntities', function () {
    assert.strictEqual(replaceEntities('&amp;'), '&');
    assert.strictEqual(replaceEntities('&#32;'), ' ');
    assert.strictEqual(replaceEntities('&#x20;'), ' ');
    assert.strictEqual(replaceEntities('&amp;&amp;'), '&&');

    assert.strictEqual(replaceEntities('&am;'), '&am;');
    assert.strictEqual(replaceEntities('&#00;'), '&#00;');
  });*/

  it('assign', function () {
    assert.deepEqual(assign({ a: 1 }, null, { b: 2 }), { a: 1, b: 2 });
    assert.throws(function () {
      assign({}, 123);
    });
  });

  it('escapeRE', function () {
    assert.strictEqual(escapeRE(' .?*+^$[]\\(){}|-'), ' \\.\\?\\*\\+\\^\\$\\[\\]\\\\\\(\\)\\{\\}\\|\\-');
  });

  it('isWhiteSpace', function () {
    assert.strictEqual(isWhiteSpace(0x2000), true);
    assert.strictEqual(isWhiteSpace(0x09), true);

    assert.strictEqual(isWhiteSpace(0x30), false);
  });

  it('isMdAsciiPunct', function () {
    assert.strictEqual(isMdAsciiPunct(0x30), false);

    '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'.split('').forEach(function (ch) {
      assert.strictEqual(isMdAsciiPunct(ch.charCodeAt(0)), true);
    });
  });

  it('unescapeMd', function () {
    assert.strictEqual(unescapeMd('\\foo'), '\\foo');
    assert.strictEqual(unescapeMd('foo'), 'foo');

    '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'.split('').forEach(function (ch) {
      assert.strictEqual(unescapeMd('\\' + ch), ch);
    });
  });

});

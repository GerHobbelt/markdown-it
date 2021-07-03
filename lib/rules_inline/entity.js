// Process html entity - &#123;, &#xAF;, &quot;, ...



import * as entities from '../common/entities.js';
import { has as has$0 } from '../common/utils.js';
import { isValidEntityCode as isValidEntityCode$0 } from '../common/utils.js';
import { fromCodePoint as fromCodePoint$0 } from '../common/utils.js';

const has = { has: has$0 }.has;
const isValidEntityCode = { isValidEntityCode: isValidEntityCode$0 }.isValidEntityCode;
const fromCodePoint = { fromCodePoint: fromCodePoint$0 }.fromCodePoint;


const DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
const NAMED_RE   = /^&([a-z][a-z0-9]{1,31});/i;


export default function entity(state, silent) {
  let ch, code, match, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x26/* & */) { return false; }

  if (pos + 1 < max) {
    ch = state.src.charCodeAt(pos + 1);

    if (ch === 0x23 /* # */) {
      match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
        }
        state.pos += match[0].length;
        return true;
      }
    } else {
      match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        if (has(entities, match[1])) {
          if (!silent) { state.pending += entities[match[1]]; }
          state.pos += match[0].length;
          return true;
        }
      }
    }
  }

  if (!silent) { state.pending += '&'; }
  state.pos++;
  return true;
}

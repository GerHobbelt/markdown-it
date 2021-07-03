// Process '\n'



import { isSpace as isSpace$0 } from '../common/utils.js';

const isSpace = { isSpace: isSpace$0 }.isSpace;


export default function newline(state, silent) {
  let pmax, max, pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x0A/* \n */) { return false; }

  pmax = state.pending.length - 1;
  max = state.posMax;

  // '  \n' -> hardbreak
  // Lookup in pending chars is bad practice! Don't copy to other rules!
  // Pending string is stored in concat mode, indexed lookups will cause
  // convertion to flat mode.
  if (!silent) {
    let token;
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
        state.pending = state.pending.replace(/ +$/, '');
        token = state.push('hardbreak', 'br', 0);
      } else {
        state.pending = state.pending.slice(0, -1);
        token = state.push('softbreak', 'br', 0);
      }
    } else {
      token = state.push('softbreak', 'br', 0);
    }
    token.position = pos;
    token.size = 1;
  }

  pos++;

  // skip heading spaces for next line
  while (pos < max && isSpace(state.src.charCodeAt(pos))) { pos++; }

  state.pos = pos;
  return true;
}

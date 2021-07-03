// heading (#, ##, ...)



import { isSpace } from '../common/utils.js';
import { trimLeftOffset } from '../common/utils.js';


export default function heading(state, startLine, endLine, silent) {
  let ch, level, tmp, token, originalPos, originalMax,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  ch  = state.src.charCodeAt(pos);
  originalPos = pos;
  originalMax = max;

  if (ch !== 0x23/* # */ || pos >= max) { return false; }

  // count heading level
  level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 0x23/* # */ && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }

  if (level > 6 || (pos < max && !isSpace(ch))) { return false; }

  if (silent) { return true; }

  // Let's cut tails like '    ###  ' from the end of string

  max = state.skipSpacesBack(max, pos);
  tmp = state.skipCharsBack(max, 0x23, pos); // #
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
    max = tmp;
  }

  state.line = startLine + 1;

  token          = state.push('heading_open', 'h' + String(level), 1);
  token.markup   = '########'.slice(0, level);
  token.map      = [ startLine, state.line ];
  token.position = originalPos;
  token.size     = pos - originalPos;

  const originalContent = state.src.slice(pos, max);
  token          = state.push('inline', '', 0);
  token.content  = originalContent.trim();
  token.map      = [ startLine, state.line ];
  token.children = [];
  token.position = pos + trimLeftOffset(originalContent);
  token.size     = token.content.length;   // (max - pos) includes leading and trailing whitespace

  token          = state.push('heading_close', 'h' + String(level), -1);
  token.markup   = '########'.slice(0, level);
  token.position = max;
  token.size     = originalMax - max;

  return true;
}

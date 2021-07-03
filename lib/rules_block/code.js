// Code block (4 spaces padded)




export default function code(state, startLine, endLine /*, silent*/) {
  let nextLine, last, token,
      pos = state.bMarks[startLine],
      endPos;

  if (state.sCount[startLine] - state.blkIndent < 4) { return false; }

  last = nextLine = startLine + 1;

  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }

    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }

  endPos = state.bMarks[last] + state.tShift[last];
  state.line = last;

  token         = state.push('code_block', 'code', 0);
  token.content = state.getLines(startLine, last, 4 + state.blkIndent, true);
  token.map     = [ startLine, state.line ];
  token.position = pos;
  token.size = endPos - pos;

  return true;
}

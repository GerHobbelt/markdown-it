/** internal
 * class ParserBlock
 *
 * Block-level tokenizer.
 **/



import Ruler from './ruler.js';
import table from './rules_block/table.js';
import code from './rules_block/code.js';
import fence from './rules_block/fence.js';
import blockquote from './rules_block/blockquote.js';
import hr from './rules_block/hr.js';
import list from './rules_block/list.js';
import reference from './rules_block/reference.js';
import htmlBlock from './rules_block/html_block.js';
import heading from './rules_block/heading.js';
import lheading from './rules_block/lheading.js';
import paragraph from './rules_block/paragraph.js';
import stateBlock from './rules_block/state_block.js';


const _rules = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  [ 'table', table, [ 'paragraph', 'reference' ] ],
  [ 'code', code ],
  [ 'fence', fence, [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'blockquote', blockquote, [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'hr', hr, [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'list', list, [ 'paragraph', 'reference', 'blockquote', 'table' ] ],
  [ 'reference', reference ],
  [ 'html_block', htmlBlock, [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'heading', heading, [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'lheading', lheading ],
  [ 'paragraph', paragraph ]
];


/**
 * new ParserBlock()
 **/
function ParserBlock() {
  /**
   * ParserBlock#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of block rules.
   **/
  this.ruler = new Ruler();

  for (let i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1], { alt: (_rules[i][2] || []).slice() });
  }
}


// Generate tokens for input range
//
ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
  let ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      line = startLine,
      hasEmptyLines = false,
      maxNesting = state.md.options.maxNesting;

  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) { break; }

    // Termination condition for nested calls.
    // Nested calls currently used for blockquotes & lists
    if (state.sCount[line] < state.blkIndent) { break; }

    // If nesting level exceeded - skip tail to the end. That's not ordinary
    // situation and we should not care about content.
    if (state.level >= maxNesting) {
      state.line = endLine;
      break;
    }

    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.line`
    // - update `state.tokens`
    // - return true

    for (i = 0; i < len; i++) {
      ok = rules[i](state, line, endLine, false);
      if (ok) { break; }
    }

    // set state.tight if we had an empty line before current tag
    // i.e. latest empty line should not count
    state.tight = !hasEmptyLines;

    // paragraph might "eat" one newline after it in nested lists
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }

    line = state.line;

    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;
      state.line = line;
    }
  }
};


/**
 * ParserBlock.parse(str, md, env, outTokens)
 *
 * Process input string and push block tokens into `outTokens`
 **/
ParserBlock.prototype.parse = function (src, md, env, outTokens) {
  let state;

  if (!src) { return; }

  state = new this.State(src, md, env, outTokens);

  this.tokenize(state, state.line, state.lineMax);
};


ParserBlock.prototype.State = stateBlock;


export default ParserBlock;

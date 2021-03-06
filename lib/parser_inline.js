/** internal
 * class ParserInline
 *
 * Tokenizes paragraph content.
 **/



import Ruler from './ruler.js';

import { preProcess as preProcessLinkify } from './rules_inline/linkify.js';
import { tokenize as linkify } from './rules_inline/linkify.js';
import { postProcess as postProcessLinkify } from './rules_inline/linkify.js';

import text from './rules_inline/text.js';
import newline from './rules_inline/newline.js';
import escape from './rules_inline/escape.js';
import backticks from './rules_inline/backticks.js';

import { tokenize as strikethrough } from './rules_inline/strikethrough.js';
import { postProcess as postProcessStrikethrough } from './rules_inline/strikethrough.js';

import { tokenize as emphasis } from './rules_inline/emphasis.js';
import { postProcess as postProcessEmphasis } from './rules_inline/emphasis.js';

import link from './rules_inline/link.js';
import image from './rules_inline/image.js';
import autolink from './rules_inline/autolink.js';
import htmlInline from './rules_inline/html_inline.js';
import entity from './rules_inline/entity.js';
import balancePairs from './rules_inline/balance_pairs.js';
import textCollapse from './rules_inline/text_collapse.js';
import stateInline from './rules_inline/state_inline.js';


////////////////////////////////////////////////////////////////////////////////
// Parser rules

const _rules0 = [
  [ 'linkify', preProcessLinkify ]
];

const _rules = [
  [ 'linkify', linkify ],
  [ 'text', text ],
  [ 'newline', newline ],
  [ 'escape', escape ],
  [ 'backticks', backticks ],
  [ 'strikethrough', strikethrough ],
  [ 'emphasis', emphasis ],
  [ 'link', link ],
  [ 'image', image ],
  [ 'autolink', autolink ],
  [ 'html_inline', htmlInline ],
  [ 'entity', entity ]
];

const _rules2 = [
  [ 'balance_pairs', balancePairs ],
  [ 'strikethrough', postProcessStrikethrough ],
  [ 'emphasis', postProcessEmphasis ],
  [ 'linkify', postProcessLinkify ],
  [ 'text_collapse', textCollapse ]
];


/**
 * new ParserInline()
 **/
function ParserInline() {
  let i;

  /**
   * ParserInline#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of inline rules.
   **/
  this.ruler = new Ruler();

  for (i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }

  /**
   * ParserInline#ruler2 -> Ruler
   *
   * [[Ruler]] instance. Second ruler used for post-processing
   * (e.g. in emphasis-like rules).
   **/
  this.ruler2 = new Ruler();

  for (i = 0; i < _rules2.length; i++) {
    this.ruler2.push(_rules2[i][0], _rules2[i][1]);
  }

  /**
   * ParserInline#ruler0 -> Ruler
   *
   * [[Ruler]] instance. Third ruler used for pre-processing
   * (e.g. in linkify rule).
   **/
  this.ruler0 = new Ruler();

  for (i = 0; i < _rules0.length; i++) {
    this.ruler0.push(_rules0[i][0], _rules0[i][1]);
  }
}


// Skip single token by running all rules in validation mode;
// returns `true` if any rule reported success
//
ParserInline.prototype.skipToken = function (state) {
  let ok, i, pos = state.pos,
      rules = this.ruler.getRules(''),
      len = rules.length,
      maxNesting = state.md.options.maxNesting,
      cache = state.cache;


  if (typeof cache[pos] !== 'undefined') {
    state.pos = cache[pos];
    return;
  }

  if (state.level < maxNesting) {
    for (i = 0; i < len; i++) {
      // Increment state.level and decrement it later to limit recursion.
      // It's harmless to do here, because no tokens are created. But ideally,
      // we'd need a separate private state variable for this purpose.
      //
      state.level++;
      ok = rules[i](state, true);
      state.level--;

      if (ok) { break; }
    }
  } else {
    // Too much nesting, just skip until the end of the paragraph.
    //
    // NOTE: this will cause links to behave incorrectly in the following case,
    //       when an amount of `[` is exactly equal to `maxNesting + 1`:
    //
    //       [[[[[[[[[[[[[[[[[[[[[foo]()
    //
    // TODO: remove this workaround when CM standard will allow nested links
    //       (we can replace it by preventing links from being parsed in
    //       validation mode)
    //
    state.pos = state.posMax;
  }

  if (!ok) { state.pos++; }
  cache[pos] = state.pos;
};


// Generate tokens for input range
//
ParserInline.prototype.tokenize = function (state) {
  let ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      end = state.posMax,
      maxNesting = state.md.options.maxNesting;

  while (state.pos < end) {
    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.pos`
    // - update `state.tokens`
    // - return true

    if (state.level < maxNesting) {
      for (i = 0; i < len; i++) {
        ok = rules[i](state, false);
        if (ok) { break; }
      }
    }

    if (ok) {
      if (state.pos >= end) { break; }
      continue;
    }

    state.pending += state.src[state.pos++];
  }

  if (state.pending) {
    state.pushPending();
  }
};


/**
 * ParserInline.parse(str, links, md, env, outTokens)
 *
 * Process input string and push inline tokens into `outTokens`
 **/
ParserInline.prototype.parse = function (str, md, env, outTokens) {
  let i, rules, len;
  const state = new this.State(str, md, env, outTokens);

  rules = this.ruler0.getRules('');
  len = rules.length;

  for (i = 0; i < len; i++) {
    rules[i](state);
  }

  this.tokenize(state);

  rules = this.ruler2.getRules('');
  len = rules.length;

  for (i = 0; i < len; i++) {
    rules[i](state);
  }
};


ParserInline.prototype.State = stateInline;


export default ParserInline;

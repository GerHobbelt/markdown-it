// Simple typographic replacements
//
// (c) (C) → ©
// (tm) (TM) → ™
// (r) (R) → ®
// +- → ±
// (p) (P) -> §
// ... → … (also ?.... → ?.., !.... → !..)
// ???????? → ???, !!!!! → !!!, `,,` → `,`
// -- → &ndash;, --- → &mdash;
// --> → →; <-- → ←; <--> → ↔
// ==> → ⇒; <== → ⇐; <==> → ⇔
//
'use strict';

// TODO:
// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
// - miltiplication 2 x 4 -> 2 × 4

var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--|==/;

var ARROW_REPLACEMENTS = {
  '<-->': '\u2194',
  '-->': '\u2192',
  '<--': '\u2190',
  '<==>': '\u21d4',
  '==>': '\u21d2',
  '<==': '\u21d0'
};

// Workaround for phantomjs - need regex without /g flag,
// or root check will fail every second time
var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i;

var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
var SCOPED_ABBR = {
  c: '©',
  r: '®',
  p: '§',
  tm: '™'
};

function replaceFn(match, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}

function replace_scoped(inlineTokens) {
  var i, token, inside_autolink = 0;

  for (i = inlineTokens.length - 1; i >= 0; i--) {
    token = inlineTokens[i];

    if (token.type === 'text' && !inside_autolink) {
      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    }

    if (token.type === 'link_open' && token.info === 'auto') {
      inside_autolink--;
    }

    if (token.type === 'link_close' && token.info === 'auto') {
      inside_autolink++;
    }
  }
}

function replace_rare(inlineTokens) {
  var i, token, inside_autolink = 0;

  function replace_arrow(m, p1, p2) {
    return p1 + (ARROW_REPLACEMENTS[p2] || p2);
  }

  for (i = inlineTokens.length - 1; i >= 0; i--) {
    token = inlineTokens[i];

    if (token.type === 'text' && !inside_autolink) {
      if (RARE_RE.test(token.content)) {
        token.content = token.content
          .replace(/\+-/g, '±')
          // ..., ....... -> …
          // but ?..... & !..... -> ?.. & !..
          .replace(/([?!])\.{4,}/g, '$1..')
          .replace(/\.{3,}/g, '…')
          .replace(/…\.+/g, '…')              // also remove superfluous periods after an ellipsis
          .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
          // <-->
          // -->
          // -->
          // <==>
          // ==>
          // -->
          .replace(/(^|[^<=-])([<]?(?:==|--)[>]?)(?=[^>=-]|$)/mg, replace_arrow)
          // and do it once more to catch input which overlaps in the detection
          // regex, e.g. `<--x-->` where the `-->` will not be detected by
          // the above `replace()` due to overlap at `x` in the rwuired match:
          .replace(/(^|[^<=-])([<]?(?:==|--)[>]?)(?=[^>=-]|$)/mg, replace_arrow)
          // em-dash
          .replace(/(^|[^-])---(?=[^-]|$)/mg, '$1\u2014')
          // en-dash
          .replace(/(^|\s)--(?=\s|$)/mg, '$1\u2013')
          .replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, '$1\u2013');
      }
    }

    if (token.type === 'link_open' && token.info === 'auto') {
      inside_autolink--;
    }

    if (token.type === 'link_close' && token.info === 'auto') {
      inside_autolink++;
    }
  }
}


module.exports = function replace(state) {
  var blkIdx;

  if (!state.md.options.typographer) { return; }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline') { continue; }

    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
      replace_scoped(state.tokens[blkIdx].children);
    }

    if (RARE_RE.test(state.tokens[blkIdx].content)) {
      replace_rare(state.tokens[blkIdx].children);
    }

  }
};

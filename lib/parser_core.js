/** internal
 * class Core
 *
 * Top-level rules executor. Glues block/inline parsers and does intermediate
 * transformations.
 **/



import Ruler from './ruler.js';
import normalize from './rules_core/normalize.js';
import block from './rules_core/block.js';
import inline from './rules_core/inline.js';
import replacements from './rules_core/replacements.js';
import smartquotes from './rules_core/smartquotes.js';
import stateCore from './rules_core/state_core.js';


const _rules = [
  [ 'normalize', normalize ],
  [ 'block', block ],
  [ 'inline', inline ],
  [ 'replacements', replacements ],
  [ 'smartquotes', smartquotes ]
];


/**
 * new Core()
 **/
function Core() {
  /**
   * Core#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of core rules.
   **/
  this.ruler = new Ruler();

  for (let i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}


/**
 * Core.process(state)
 *
 * Executes core chain rules.
 **/
Core.prototype.process = function (state) {
  let i, l, rules;

  rules = this.ruler.getRules('');

  for (i = 0, l = rules.length; i < l; i++) {
    rules[i](state);
  }
};

Core.prototype.State = stateCore;


export default Core;

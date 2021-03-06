

/*eslint-env browser*/
/*global $, _*/

const mdurl = require('mdurl');


const hljs = require('@gerhobbelt/highlight.js');

hljs.registerLanguage('actionscript', require('@gerhobbelt/highlight.js/lib/languages/actionscript'));
hljs.registerLanguage('apache',       require('@gerhobbelt/highlight.js/lib/languages/apache'));
hljs.registerLanguage('armasm',       require('@gerhobbelt/highlight.js/lib/languages/armasm'));
hljs.registerLanguage('xml',          require('@gerhobbelt/highlight.js/lib/languages/xml'));
hljs.registerLanguage('asciidoc',     require('@gerhobbelt/highlight.js/lib/languages/asciidoc'));
hljs.registerLanguage('avrasm',       require('@gerhobbelt/highlight.js/lib/languages/avrasm'));
hljs.registerLanguage('bash',         require('@gerhobbelt/highlight.js/lib/languages/bash'));
hljs.registerLanguage('clojure',      require('@gerhobbelt/highlight.js/lib/languages/clojure'));
hljs.registerLanguage('cmake',        require('@gerhobbelt/highlight.js/lib/languages/cmake'));
hljs.registerLanguage('coffeescript', require('@gerhobbelt/highlight.js/lib/languages/coffeescript'));
hljs.registerLanguage('cpp',          require('@gerhobbelt/highlight.js/lib/languages/cpp'));
hljs.registerLanguage('c',            require('@gerhobbelt/highlight.js/lib/languages/c'));
hljs.registerLanguage('csharp',       require('@gerhobbelt/highlight.js/lib/languages/csharp'));
hljs.registerLanguage('arduino',      require('@gerhobbelt/highlight.js/lib/languages/arduino'));
hljs.registerLanguage('css',          require('@gerhobbelt/highlight.js/lib/languages/css'));
hljs.registerLanguage('diff',         require('@gerhobbelt/highlight.js/lib/languages/diff'));
hljs.registerLanguage('django',       require('@gerhobbelt/highlight.js/lib/languages/django'));
hljs.registerLanguage('dockerfile',   require('@gerhobbelt/highlight.js/lib/languages/dockerfile'));
hljs.registerLanguage('ruby',         require('@gerhobbelt/highlight.js/lib/languages/ruby'));
hljs.registerLanguage('fortran',      require('@gerhobbelt/highlight.js/lib/languages/fortran'));
hljs.registerLanguage('glsl',         require('@gerhobbelt/highlight.js/lib/languages/glsl'));
hljs.registerLanguage('go',           require('@gerhobbelt/highlight.js/lib/languages/go'));
hljs.registerLanguage('groovy',       require('@gerhobbelt/highlight.js/lib/languages/groovy'));
hljs.registerLanguage('handlebars',   require('@gerhobbelt/highlight.js/lib/languages/handlebars'));
hljs.registerLanguage('haskell',      require('@gerhobbelt/highlight.js/lib/languages/haskell'));
hljs.registerLanguage('ini',          require('@gerhobbelt/highlight.js/lib/languages/ini'));
hljs.registerLanguage('java',         require('@gerhobbelt/highlight.js/lib/languages/java'));
hljs.registerLanguage('javascript',   require('@gerhobbelt/highlight.js/lib/languages/javascript'));
hljs.registerLanguage('json',         require('@gerhobbelt/highlight.js/lib/languages/json'));
hljs.registerLanguage('latex',        require('@gerhobbelt/highlight.js/lib/languages/latex'));
hljs.registerLanguage('less',         require('@gerhobbelt/highlight.js/lib/languages/less'));
hljs.registerLanguage('lisp',         require('@gerhobbelt/highlight.js/lib/languages/lisp'));
hljs.registerLanguage('livescript',   require('@gerhobbelt/highlight.js/lib/languages/livescript'));
hljs.registerLanguage('lua',          require('@gerhobbelt/highlight.js/lib/languages/lua'));
hljs.registerLanguage('makefile',     require('@gerhobbelt/highlight.js/lib/languages/makefile'));
hljs.registerLanguage('matlab',       require('@gerhobbelt/highlight.js/lib/languages/matlab'));
hljs.registerLanguage('mipsasm',      require('@gerhobbelt/highlight.js/lib/languages/mipsasm'));
hljs.registerLanguage('perl',         require('@gerhobbelt/highlight.js/lib/languages/perl'));
hljs.registerLanguage('nginx',        require('@gerhobbelt/highlight.js/lib/languages/nginx'));
hljs.registerLanguage('objectivec',   require('@gerhobbelt/highlight.js/lib/languages/objectivec'));
hljs.registerLanguage('php',          require('@gerhobbelt/highlight.js/lib/languages/php'));
//hljs.registerLanguage('phptemplate',  require('@gerhobbelt/highlight.js/lib/languages/phptemplate'));
hljs.registerLanguage('python',       require('@gerhobbelt/highlight.js/lib/languages/python'));
hljs.registerLanguage('python-repl',  require('@gerhobbelt/highlight.js/lib/languages/python-repl'));
hljs.registerLanguage('rust',         require('@gerhobbelt/highlight.js/lib/languages/rust'));
hljs.registerLanguage('scala',        require('@gerhobbelt/highlight.js/lib/languages/scala'));
hljs.registerLanguage('scheme',       require('@gerhobbelt/highlight.js/lib/languages/scheme'));
hljs.registerLanguage('scss',         require('@gerhobbelt/highlight.js/lib/languages/scss'));
hljs.registerLanguage('smalltalk',    require('@gerhobbelt/highlight.js/lib/languages/smalltalk'));
hljs.registerLanguage('stylus',       require('@gerhobbelt/highlight.js/lib/languages/stylus'));
hljs.registerLanguage('swift',        require('@gerhobbelt/highlight.js/lib/languages/swift'));
hljs.registerLanguage('tcl',          require('@gerhobbelt/highlight.js/lib/languages/tcl'));
hljs.registerLanguage('typescript',   require('@gerhobbelt/highlight.js/lib/languages/typescript'));
hljs.registerLanguage('verilog',      require('@gerhobbelt/highlight.js/lib/languages/verilog'));
hljs.registerLanguage('vhdl',         require('@gerhobbelt/highlight.js/lib/languages/vhdl'));
hljs.registerLanguage('yaml',         require('@gerhobbelt/highlight.js/lib/languages/yaml'));


let mdHtml, mdSrc, permalink, scrollMap;

const defaults = {
  html:         false,        // Enable HTML tags in source
  xhtmlOut:     false,        // Use '/' to close single tags (<br />)
  breaks:       false,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'language-',  // CSS language prefix for fenced blocks
  pickNumber:   1,            // the chosen alternative from a set of similar plugins
  linkify:      true,         // autoconvert URL-like texts to links

  // highSecurity:
  // - false:           lower protection against XSS/Unicode-Homologue/etc. attacks via the input MarkDown.
  //                    This setting assumes you own or at least trust the Markdown
  //                    being fed to MarkDonw-It. The result is a nicer render.
  // - true (default):  maximum protection against XSS/Unicode-Homologue/etc. attacks via the input MarkDown.
  //                    This is the default setting and assumes you have no control or absolute trust in the Markdown
  //                    being fed to MarkDonw-It. Use this setting when using markdown-it as part of a forum or other
  //                    website where more-or-less arbitrary users can enter and feed any MarkDown to markdown-it.
  //
  // See https://en.wikipedia.org/wiki/Internationalized_domain_name for details on homograph attacks, for example.
  highSecurity: false,

  typographer:  true,         // Enable smartypants and other sweet transforms

  // options below are for demo only
  _highlight:   true,
  _strict:      false,
  _view:        'html',       // html / src / debug

  // modify-token plugin:
  modifyToken: function (token, env) {
    console.log('TOKEN:', token, !!env);
    // switch (token.type) {
    // case 'image': // set all images to 200px width
    //   token.attrObj.width = '200px';
    //   break;
    // case 'link_open':
    //   token.attrObj.target = '_blank'; // set all links to open in new window
    //   break;
    // }
  }
};

defaults.highlight = function (str, lang) {
  const esc = mdHtml.utils.escapeHtml;

  try {
    if (!defaults._highlight) {
      throw 'highlighting disabled';
    }

    if (lang && lang !== 'auto' && hljs.getLanguage(lang)) {

      return '<pre class="hljs language-' + esc(lang.toLowerCase()) + '"><code>' +
             hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
             '</code></pre>';

    } else if (lang === 'auto') {

      const result = hljs.highlightAuto(str);

      /*eslint-disable no-console*/
      console.log('highlight language: ' + result.language + ', relevance: ' + result.relevance);

      return '<pre class="hljs language-' + esc(result.language) + '"><code>' +
             result.value +
             '</code></pre>';
    }
  } catch (__) { /**/ }

  return '<pre class="hljs"><code>' + esc(str) + '</code></pre>';
};

function setOptionClass(name, val) {
  if (val) {
    $('body').addClass('opt_' + name);
  } else {
    $('body').removeClass('opt_' + name);
  }
}

function setResultView(val) {
  $('body').removeClass('result-as-html');
  $('body').removeClass('result-as-src');
  $('body').removeClass('result-as-debug');
  $('body').addClass('result-as-' + val);
  defaults._view = val;
}

function pick(pckg1, pckg2, pckg3, pckg4) {
  let rv;
  console.log('PICK:', defaults.pickNumber, '-->', +defaults.pickNumber);
  switch (+defaults.pickNumber) {
  case 1:
    rv = pckg1;
    break;

  case 2:
    rv = pckg2;
    break;

  case 3:
    rv = pckg3;
    break;

  case 4:
    rv = pckg4;
    break;
  }
  return rv || pckg1;
}

function usePlugins(md) {
  return md
  .use(require('@gerhobbelt/markdown-it-abbr'))
  .use(require('@gerhobbelt/markdown-it-attrs'))
  .use(require('@gerhobbelt/markdown-it-attribution'))
  .use(require('@gerhobbelt/markdown-it-container'), 'warning')
  .use(require('@gerhobbelt/markdown-it-checkbox'))
  .use(require('@gerhobbelt/markdown-it-deflist'))
  .use(require('@gerhobbelt/markdown-it-emoji'))
  .use(require('@gerhobbelt/markdown-it-fontawesome'))
  .use(require('@gerhobbelt/markdown-it-footnote'))
  .use(require('@gerhobbelt/markdown-it-front-matter'), function processFrontMatter(fm) {
    console.log('FrontMatter:', fm);
  })
  .use(require('@gerhobbelt/markdown-it-hashtag'))
  .use(require('@gerhobbelt/markdown-it-header-sections'))
  .use(require('@gerhobbelt/markdown-it-headinganchor'), {
    // anchorClass: 'my-class-name', // default: 'markdown-it-headinganchor'
    // addHeadingID: true,           // default: true
    // addHeadingAnchor: true,       // default: true
    // slugify: function(str, md) {} // default: 'My Heading' -> 'MyHeading'
  })
  .use(require('@gerhobbelt/markdown-it-implicit-figures'))
  .use(require('@gerhobbelt/markdown-it-ins'))
  .use(require('@gerhobbelt/markdown-it-kbd'))
  .use(require('@gerhobbelt/markdown-it-mark'))
  .use(require('@gerhobbelt/markdown-it-mathjax'))
  .use(require('@gerhobbelt/markdown-it-modify-token'))

  .use(pick(
    require('@gerhobbelt/markdown-it-prism'),
    require('@gerhobbelt/markdown-it-highlighted'),
    require('@gerhobbelt/markdown-it-highlightjs')
  ))

/*  .use(require('@gerhobbelt/markdown-it-responsive'), {
    responsive: {
      srcset: {
        'header-*': [ {
          width: 320,
          rename: {
            suffix: '-small'
          }
        }, {
          width: 640,
          rename: {
            suffix: '-medium'
          }
        } ]
      },
      sizes: {
        'header-*': '(min-width: 36em) 33.3vw, 100vw'
      }
    }
  })
*/
  .use(require('@gerhobbelt/markdown-it-samp'))
  //.use(require('@gerhobbelt/markdown-it-sanitizer'))    <-- don't use this one when you want custom html to make it through to the output!
  //.use(require('@gerhobbelt/markdown-it-smartarrows'))  <-- modern markdown-it `typographer` option has it all, and then some! :-)
  .use(require('@gerhobbelt/markdown-it-strikethrough-alt'))
  .use(require('@gerhobbelt/markdown-it-sub'))
  .use(require('@gerhobbelt/markdown-it-sup'))

  .use(pick(
    require('@gerhobbelt/markdown-it-table-of-contents'),
    require('@gerhobbelt/markdown-it-toc')
    //require('@gerhobbelt/markdown-it-toc-and-anchor')
  ))

  //.use(require('@gerhobbelt/markdown-it-title'))
  .use(require('@gerhobbelt/markdown-it-wikilinks'));
}

function mdInit() {
  console.log('SETTINGS:', defaults);
  if (defaults._strict) {
    mdHtml = window.markdownit('commonmark');
    mdSrc = window.markdownit('commonmark');
  } else {
    mdHtml = usePlugins(window.markdownit(defaults));
    mdSrc = usePlugins(window.markdownit(defaults));
  }

  // Beautify output of parser for html content
  mdHtml.renderer.rules.table_open = function () {
    return '<table class="table table-striped">\n';
  };
  // Replace emoji codes with images
  mdHtml.renderer.rules.emoji = function (token, idx) {
    return window.twemoji.parse(token[idx].content);
  };


  //
  // Inject line numbers for sync scroll. Notes:
  //
  // - We track only headings and paragraphs on first level. That's enough.
  // - Footnotes content causes jumps. Level limit filter it automatically.
  function injectLineNumbers(tokens, idx, options, env, slf) {
    let line;
    if (tokens[idx].map && tokens[idx].level === 0) {
      line = tokens[idx].map[0];
      tokens[idx].attrJoin('class', 'line');
      tokens[idx].attrSet('data-line', String(line));
    }
    return slf.renderToken(tokens, idx, options, env, slf);
  }

  mdHtml.renderer.rules.paragraph_open = mdHtml.renderer.rules.heading_open = injectLineNumbers;
}

function setHighlightedlContent(selector, content, lang) {
  if (window.hljs) {
    $(selector).html(window.hljs.highlight(content, { language: lang }).value);
  } else {
    $(selector).text(content);
  }
}

function updateResult() {
  const source = $('.source').val();

  // Update only active view to avoid slowdowns
  // (debug & src view with highlighting are a bit slow)
  if (defaults._view === 'src') {
    setHighlightedlContent('.result-src-content', mdSrc.render(source), 'html');

  } else if (defaults._view === 'debug') {
    setHighlightedlContent(
      '.result-debug-content',
      JSON.stringify(mdSrc.parse(source, { references: {} }), null, 2),
      'json'
    );

  } else { /*defaults._view === 'html'*/
    $('.result-html').html(mdHtml.render(source));
  }

  // reset lines mapping cache on content update
  scrollMap = null;

  try {
    if (source) {
      // serialize state - source and options
      permalink.href = '#md3=' + mdurl.encode(JSON.stringify({
        source: source,
        defaults: _.omit(defaults, 'highlight')
      }), '-_.!~', false);
    } else {
      permalink.href = '';
    }
  } catch (__) {
    permalink.href = '';
  }
}

// Build offsets for each line (lines can be wrapped)
// That's a bit dirty to process each line everytime, but ok for demo.
// Optimizations are required only for big texts.
function buildScrollMap() {
  let i, offset, nonEmptyList, pos, a, b, lineHeightMap, linesCount,
      acc, sourceLikeDiv, textarea = $('.source'),
      _scrollMap;

  sourceLikeDiv = $('<div />').css({
    position: 'absolute',
    visibility: 'hidden',
    height: 'auto',
    width: textarea[0].clientWidth,
    'font-size': textarea.css('font-size'),
    'font-family': textarea.css('font-family'),
    'line-height': textarea.css('line-height'),
    'white-space': textarea.css('white-space')
  }).appendTo('body');

  offset = $('.result-html').scrollTop() - $('.result-html').offset().top;
  _scrollMap = [];
  nonEmptyList = [];
  lineHeightMap = [];

  acc = 0;
  textarea.val().split('\n').forEach(function (str) {
    let h, lh;

    lineHeightMap.push(acc);

    if (str.length === 0) {
      acc++;
      return;
    }

    sourceLikeDiv.text(str);
    h = parseFloat(sourceLikeDiv.css('height'));
    lh = parseFloat(sourceLikeDiv.css('line-height'));
    acc += Math.round(h / lh);
  });
  sourceLikeDiv.remove();
  lineHeightMap.push(acc);
  linesCount = acc;

  for (i = 0; i < linesCount; i++) { _scrollMap.push(-1); }

  nonEmptyList.push(0);
  _scrollMap[0] = 0;

  $('.line').each(function (n, el) {
    let $el = $(el), t = $el.data('line');
    if (t === '') { return; }
    t = lineHeightMap[t];
    if (t !== 0) { nonEmptyList.push(t); }
    _scrollMap[t] = Math.round($el.offset().top + offset);
  });

  nonEmptyList.push(linesCount);
  _scrollMap[linesCount] = $('.result-html')[0].scrollHeight;

  pos = 0;
  for (i = 1; i < linesCount; i++) {
    if (_scrollMap[i] !== -1) {
      pos++;
      continue;
    }

    a = nonEmptyList[pos];
    b = nonEmptyList[pos + 1];
    _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a));
  }

  return _scrollMap;
}

// Synchronize scroll position from source to result
const syncResultScroll = _.debounce(function () {
  let textarea   = $('.source'),
      lineHeight = parseFloat(textarea.css('line-height')),
      lineNo, posTo;

  lineNo = Math.floor(textarea.scrollTop() / lineHeight);
  if (!scrollMap) { scrollMap = buildScrollMap(); }
  posTo = scrollMap[lineNo];
  $('.result-html').stop(true).animate({
    scrollTop: posTo
  }, 100, 'linear');
}, 50, { maxWait: 50 });

// Synchronize scroll position from result to source
const syncSrcScroll = _.debounce(function () {
  let resultHtml = $('.result-html'),
      scrollTop  = resultHtml.scrollTop(),
      textarea   = $('.source'),
      lineHeight = parseFloat(textarea.css('line-height')),
      lines,
      i,
      line;

  if (!scrollMap) { scrollMap = buildScrollMap(); }

  lines = Object.keys(scrollMap);

  if (lines.length < 1) {
    return;
  }

  line = lines[0];

  for (i = 1; i < lines.length; i++) {
    if (scrollMap[lines[i]] < scrollTop) {
      line = lines[i];
      continue;
    }

    break;
  }

  textarea.stop(true).animate({
    scrollTop: lineHeight * line
  }, 100, 'linear');
}, 50, { maxWait: 50 });


function loadPermalink() {

  if (!location.hash) { return; }

  let cfg, opts;

  try {

    if (/^#md3=/.test(location.hash)) {
      cfg = JSON.parse(mdurl.decode(location.hash.slice(5), mdurl.decode.componentChars));

    } else if (/^#md64=/.test(location.hash)) {
      cfg = JSON.parse(window.atob(location.hash.slice(6)));

    } else if (/^#md=/.test(location.hash)) {
      cfg = JSON.parse(decodeURIComponent(location.hash.slice(4)));

    } else {
      return;
    }

    if (_.isString(cfg.source)) {
      $('.source').val(cfg.source);
    }
  } catch (__) {
    return;
  }

  opts = _.isObject(cfg.defaults) ? cfg.defaults : {};

  // copy config to defaults, but only if key exists
  // and value has the same type
  _.forOwn(opts, function (val, key) {
    if (!_.has(defaults, key)) { return; }

    // Legacy, for old links
    if (key === '_src') {
      defaults._view = val ? 'src' : 'html';
      return;
    }

    if ((_.isBoolean(defaults[key]) && _.isBoolean(val)) ||
        (_.isString(defaults[key]) && _.isString(val))) {
      defaults[key] = val;
    }
  });

  // sanitize for sure
  if ([ 'html', 'src', 'debug' ].indexOf(defaults._view) === -1) {
    defaults._view = 'html';
  }
}


//////////////////////////////////////////////////////////////////////////////
// Init on page load
//
$(function () {
  // highlight snippet
  if (window.hljs) {
    $('pre.code-sample code').each(function (i, block) {
      window.hljs.highlightBlock(block);
    });
  }

  loadPermalink();

  // Activate tooltips
  $('._tip').tooltip({ container: 'body' });

  // Set default option values and option listeners
  _.forOwn(defaults, function (val, key) {
    if (key === 'highlight') { return; }

    const el = document.getElementById(key);

    if (!el) { return; }

    const $el = $(el);

    if (_.isBoolean(val)) {
      $el.prop('checked', val);
      $el.on('change', function () {
        const value = Boolean($el.prop('checked'));
        setOptionClass(key, value);
        defaults[key] = value;
        mdInit();
        updateResult();
      });
      setOptionClass(key, val);

    } else {
      $(el).val(val);
      $el.on('change update keyup', function () {
        defaults[key] = String($(el).val());
        mdInit();
        updateResult();
      });
    }
  });

  setResultView(defaults._view);

  mdInit();
  permalink = document.getElementById('permalink');

  // Setup listeners
  $('.source').on('keyup paste cut mouseup', _.debounce(updateResult, 300, { maxWait: 500 }));

  $('.source').on('touchstart mouseover', function () {
    $('.result-html').off('scroll');
    $('.source').on('scroll', syncResultScroll);
  });

  $('.result-html').on('touchstart mouseover', function () {
    $('.source').off('scroll');
    $('.result-html').on('scroll', syncSrcScroll);
  });

  $('.source-clear').on('click', function (event) {
    $('.source').val('');
    updateResult();
    event.preventDefault();
  });

  $(document).on('click', '[data-result-as]', function (event) {
    const view = $(this).data('resultAs');
    if (view) {
      setResultView(view);
      // only to update permalink
      updateResult();
      event.preventDefault();
    }
  });

  // Need to recalculate line positions on window resize
  $(window).on('resize', function () {
    scrollMap = null;
  });

  updateResult();
});

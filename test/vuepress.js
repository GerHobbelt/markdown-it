// tests which consider the use of markdown inside vuepress and how to mix with components, etc.components
//
// e.g.: https://v1.vuepress.vuejs.org/guide/using-vue.html#browser-api-access-restrictions
//
// VuePress
/*

#Using Vue in Markdown

#Browser API Access Restrictions

Because VuePress applications are server-rendered in Node.js when generating static builds, any Vue usage must conform to the universal code requirements. In short, make sure to only access Browser / DOM APIs in beforeMount or mounted hooks.

If you are using or demoing components that are not SSR friendly (for example containing custom directives), you can wrap them inside the built-in <ClientOnly> component:

```
<ClientOnly>
  <NonSSRFriendlyComponent/>
</ClientOnly>
```

Note this does not fix components or libraries that access Browser APIs on import - to use code that assumes a browser environment on import, you need to dynamically import them in proper lifecycle hooks:

```
<script>
export default {
  mounted () {
    import('./lib-that-access-window-on-import').then(module => {
      // use code
    })
  }
}
</script>
```

If your module export default a Vue component, you can register it dynamically:

```
<template>
  <component v-if="dynamicComponent" :is="dynamicComponent"></component>
</template>

<script>
export default {
  data() {
    return {
      dynamicComponent: null
    }
  },

  mounted () {
    import('./lib-that-access-window-on-import').then(module => {
      this.dynamicComponent = module.default
    })
  }
}
</script>
```

Also see:

Vue.js > Dynamic Components

#Templating

#Interpolation

Each Markdown file is first compiled into HTML and then passed on as a Vue component to vue-loader. This means you can use Vue-style interpolation in text:

Input

```
{{ 1 + 1 }}
```

Output

```
2
```

#Directives

Directives also work:

Input

```
<span v-for="i in 3">{{ i }} </span>
```

Output

```
1 2 3
```

#Access to Site & Page Data

The compiled component does not have any private data but does have access to the site metadata. For example:

Input

```
{{ $page }}
```

Output

```
{
  "path": "/using-vue.html",
  "title": "Using Vue in Markdown",
  "frontmatter": {}
}
```

#Escaping

By default, fenced code blocks are automatically wrapped with v-pre. To display raw mustaches or Vue-specific syntax inside inline code snippets or plain text, you need to wrap a paragraph with the v-pre custom container:

Input

```
::: v-pre
`{{ This will be displayed as-is }}`
:::
```

Output

```
{{ This will be displayed as-is }}
```


#Using Components

Any *.vue files found in .vuepress/components are automatically registered as global, async components. For example:

```
.
└─ .vuepress
   └─ components
      ├─ demo-1.vue
      ├─ OtherComponent.vue
      └─ Foo
         └─ Bar.vue
```

Inside any Markdown file you can then directly use the components (names are inferred from filenames):

```
<demo-1/>
<OtherComponent/>
<Foo-Bar/>
```

```
Hello this is <demo-1>
```

```
This is another component
```

```
Hello this is <Foo-Bar>
```

IMPORTANT

Make sure a custom component’s name either contains a hyphen or is in PascalCase. Otherwise it will be treated as an inline element and wrapped inside a <p> tag, which will lead to hydration mismatch because <p> does not allow block elements to be placed inside it.

#Using Components In Headers

You can use Vue components in the headers, but note the difference between the following two ways:

+------------+---------------+---------------
|  Markdown  |  Output HTML  |  Parsed Header
|  # text <Tag/>   |  <h1>text <Tag/></h1>  |  text
| # text `<Tag/>`  |  <h1>text <code>&lt;Tag/&gt;</code></h1>  |  text <Tag/>

The HTML wrapped by <code> will be displayed as is, only the HTML that is not wrapped will be parsed by Vue.

TIP

The output HTML is accomplished by markdown-it, while the parsed headers are done by VuePress, and used for the sidebar and the document title.

#Using Pre-processors

VuePress has built-in webpack config for the following pre-processors: sass, scss, less, stylus and pug. All you need to do is installing the corresponding dependencies. For example, to enable sass, install the following in your project:

```
yarn add -D sass-loader node-sass
```

Now you can use the following in Markdown and theme components:

```
<style lang="sass">
.title
  font-size: 20px
</style>
```

Using <template lang="pug"> requires installing pug and pug-plain-loader:

```
yarn add -D pug pug-plain-loader
```

TIP

If you are a Stylus user, you don’t need to install stylus and stylus-loader in your project because VuePress uses Stylus internally.

For pre-processors that do not have built-in webpack config support, you will need to extend the internal webpack config and install the necessary dependencies.

#Script & Style Hoisting

Sometimes you may need to apply some JavaScript or CSS only to the current page. In those cases, you can directly write root-level <script> or <style> blocks in the Markdown file, and they will be hoisted out of the compiled HTML and used as the <script> and <style> blocks for the resulting Vue single-file component.

This is rendered by inline script and styled by inline CSS

#Built-In Components

#OutboundLink stable

It() is used to specify that this is an external link. In VuePress, this component has been followed by every external link.

#ClientOnly stable

See Browser API Access Restrictions.

#Content

Props:

pageKey - string, page's hash key, defaults to current page’s key.
slotKey - string, key of Markdown slot. Defaults to default slot.

Usage：

Specify a specific slot for a specific page (.md) for rendering. This will be useful when you use Custom Layout or Writing a theme

```
<Content/>
```

Also see:

Global Computed > $page
Markdown Slot
Writing a theme > Content Outlet

#Badge beta default theme

Props:

text - string
type - string, optional value: "tip"|"warning"|"error", defaults to "tip".
vertical - string, optional value: "top"|"middle", defaults to "top".

Usage:

You can use this component in header to add some status for some API:

### Badge <Badge text="beta" type="warning"/> <Badge text="default theme"/>

Also see:

Using Components In Headers

*/





/*


let assert = require('chai').assert;
let markdownit = require('../');



const Config = require('@gerhobbelt/markdown-it-chain');
const PLUGINS = {
  COMPONENT: 'component',
  HIGHLIGHT_LINES: 'highlight-lines',
  PRE_WRAPPER: 'pre-wrapper',
  SNIPPET: 'snippet',
  CONVERT_ROUTER_LINK: 'convert-router-link',
  HOIST_SCRIPT_STYLE: 'hoist-script-style',
  ANCHOR: 'anchor',
  EMOJI: 'emoji',
  TOC: 'toc',
  LINE_NUMBERS: 'line-numbers'
};

const emojiPlugin = require('@gerhobbelt/markdown-it-emoji');
const anchorPlugin = require('@gerhobbelt/markdown-it-anchor');
const tocPlugin = require('@gerhobbelt/markdown-it-table-of-contents');




describe('vuepress with vanilla markdown-it', function () {
  this.timeout(10000);

  // return a (simplified) vuepress-default markdown-it vanilla instance:
  function getMd() {
    return markdownit({ html: true });
  }


  let md;

  before(function (done) {
    md = getMd();
    done();
  });

  it('vue tags should make it through unscathed', function () {
    //var md = getMd();

    let input = `
<ClientOnly>
  <NonSSRFriendlyComponent/>
</ClientOnly>
      `.trim();
    let sollwert = input;
    assert.strictEqual(md.render(input), sollwert);

    input = `
<style lang="sass">
.title
  font-size: 20px
</style>
      `;
    sollwert = `${input.trim()}\n`;
    assert.strictEqual(md.render(input), sollwert);
  });

  it('vue template interpolation expressions should make it through unscathed', function () {
    //var md = getMd();

    let input = '{{ 1 + 1 }}';
    let sollwert = `<p>${input}</p>\n`;
    assert.strictEqual(md.render(input), sollwert);
  });

  it('vue template directives should make it through unscathed', function () {
    //var md = getMd();

    let input = '<span v-for="i in 3">{{ i }} </span>';
    let sollwert = `<p>${input}</p>\n`;
    assert.strictEqual(md.render(input), sollwert);
  });

  it('vue template data should make it through unscathed', function () {
    //var md = getMd();

    let input = '{{ $page }}';
    let sollwert = `<p>${input}</p>\n`;
    assert.strictEqual(md.render(input), sollwert);
  });

  it('vue built-in components should make it through unscathed', function () {
    //var md = getMd();

    let input = `
<Content/>

[...]

You can use this component in header to add some status for some API:

### Badge <Badge text="beta" type="warning"/> <Badge text="default theme"/>
    `;
    let sollwert = `
<Content/>
<p>[...]</p>
<p>You can use this component in header to add some status for some API:</p>
<h3>Badge <Badge text="beta" type="warning"/> <Badge text="default theme"/></h3>\n`.trimLeft();
    assert.strictEqual(md.render(input), sollwert);
  });

});






xdescribe('vuepress with fully pimped markdown-it', function () {

  // chunks of this testcode have been ripped from @vuepress/markdown and ../support/demo-template/index.js:

  const pickNumber = 2;

  function pick(pckg1, pckg2, pckg3, pckg4) {
    let rv;
    //console.log('PICK:', pickNumber);
    switch (pickNumber) {
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


  // return a (fully pimped = all possible plugins loaded) vuepress-equiv markdown-it instance:
  function getMd() {
    //return markdownit({ html: true });

    // using chainedAPI
    const config = new Config();

    let highlight = pick(
      require('@gerhobbelt/markdown-it-prism'),
      require('@gerhobbelt/markdown-it-highlighted'),
      require('@gerhobbelt/markdown-it-highlightjs')
    );

    config
      .options
        .html(true)
        .typographer(true)
        .highlight(highlight)
        .end()

      //.plugin(PLUGINS.COMPONENT)
      //  .use(componentPlugin)
      //  .end()

      //.plugin(PLUGINS.HIGHLIGHT_LINES)
      //  .use(highlightLinesPlugin)
      //  .end()

      //.plugin(PLUGINS.PRE_WRAPPER)
      //  .use(preWrapperPlugin)
      //  .end()

      //.plugin(PLUGINS.SNIPPET)
      //  .use(snippetPlugin)
      //  .end()

      //.plugin(PLUGINS.CONVERT_ROUTER_LINK)
      //  .use(convertRouterLinkPlugin, [Object.assign({
      //    target: '_blank',
      //    rel: 'noopener noreferrer'
      //  }, externalLinks)])
      //  .end()

      //.plugin(PLUGINS.HOIST_SCRIPT_STYLE)
      //  .use(hoistScriptStylePlugin)
      //  .end()

      .plugin(PLUGINS.EMOJI)
        .use(emojiPlugin)
        .end()

      .plugin(PLUGINS.ANCHOR)
        .use(anchorPlugin, [ {
          permalink: true,
          permalinkBefore: true,
          permalinkSymbol: '#'
        } ])
        .end()

      .plugin(PLUGINS.TOC)
        .use(tocPlugin, [ {
          includeLevel: [ 2, 3 ]
        } ])
        .end();


    let md = config.toMd(markdownit, {});

    md = md
    .use(require('@gerhobbelt/markdown-it-abbr'))
    .use(require('@gerhobbelt/markdown-it-attrs'))
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

    .use(require('@gerhobbelt/markdown-it-responsive'), {
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

    .use(require('@gerhobbelt/markdown-it-samp'))
    //.use(require('@gerhobbelt/markdown-it-sanitizer'))    <-- don't use this one when you want custom html to make it through to the output!
    .use(require('@gerhobbelt/markdown-it-smartarrows'))
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

    return md;
  }


  let md;

  before(function (done) {
    md = getMd();
    done();
  });

  it('vue tags should make it through unscathed', function () {
    //var md = getMd();

    let input = `
<ClientOnly>
  <NonSSRFriendlyComponent/>
</ClientOnly>
      `.trim();
    let sollwert = input;
    assert.strictEqual(md.render(input), sollwert);

    input = `
<style lang="sass">
.title
  font-size: 20px
</style>
      `;
    sollwert = `${input.trim()}\n`;
    assert.strictEqual(md.render(input), sollwert);
  });

  it('vue template interpolation expressions should make it through unscathed', function () {
    //var md = getMd();

    let input = '{{ 1 + 1 }}';
    let sollwert = `<p>${input}</p>\n`;
    assert.strictEqual(md.render(input), sollwert);
  });

  it('vue template directives should make it through unscathed', function () {
    //var md = getMd();

    let input = '<span v-for="i in 3">{{ i }} </span>';
    let sollwert = `<p>${input}</p>\n`;
    assert.strictEqual(md.render(input), sollwert);
  });

  it('vue template data should make it through unscathed', function () {
    //var md = getMd();

    let input = '{{ $page }}';
    let sollwert = `<p>${input}</p>\n`;
    assert.strictEqual(md.render(input), sollwert);
  });

  xit('vue built-in components should make it through unscathed', function () {
    //var md = getMd();

    let input = `
<Content/>

[...]

You can use this component in header to add some status for some API:

### Badge <Badge text="beta" type="warning"/> <Badge text="default theme"/>
    `;
    let sollwert = `
<Content/>
<p>[…]</p>
<p>You can use this component in header to add some status for some API:</p>
<section id="Badge%3CBadgetext%3D%22beta%22type%3D%22warning%22%2F%3E%3CBadgetext%3D%22defaulttheme%22%2F%3E" id="Badge%3CBadgetext%3D%22beta%22type%3D%22warning%22%2F%3E%3CBadgetext%3D%22defaulttheme%22%2F%3E">
<h3><a id="Badge_Badge_textbeta_typewarning_Badge_textdefault_theme_7"></a><a name="Badge%3CBadgetext%3D%22beta%22type%3D%22warning%22%2F%3E%3CBadgetext%3D%22defaulttheme%22%2F%3E" class="markdown-it-headinganchor" href="#"></a><a class="header-anchor" href="#badge" aria-hidden="true">#</a> Badge <Badge text="beta" type="warning"/> <Badge text="default theme"/></h3>
</section>\n`.trimLeft();
    assert.strictEqual(md.render(input), sollwert);
  });

});




*/


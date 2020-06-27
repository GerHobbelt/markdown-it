

let commonmark = require('commonmark');
let parser = new commonmark.Parser();
let renderer = new commonmark.HtmlRenderer();

exports.run = function (data) {
  return renderer.render(parser.parse(data));
};



const commonmark = require('commonmark');
const parser = new commonmark.Parser();
const renderer = new commonmark.HtmlRenderer();

exports.run = function (data) {
  return renderer.render(parser.parse(data));
};

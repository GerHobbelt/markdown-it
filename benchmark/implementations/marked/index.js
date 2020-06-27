

let marked = require('marked');

exports.run = function (data) {
  return marked(data);
};

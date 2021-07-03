

import { MarkdownIt as markdownit } from '../index.js';


export function render(str) {
  return markdownit().render(str);
}

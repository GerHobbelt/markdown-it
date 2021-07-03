#!/usr/bin/env node



/* eslint-env es6 */
import fs from 'fs';


const src = fs.readFileSync('node_modules/entities/lib/maps/entities.json', 'utf8');
const json = JSON.parse(src);

const js = `
// HTML5 entities map: { name -> utf16string }
//


/*eslint quotes:0*/
//export * from "entities/lib/maps/entities.json";

export default ${ JSON.stringify(json, null, 2) };

`;

fs.writeFileSync('lib/common/entities.js', js, 'utf8');

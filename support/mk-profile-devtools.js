//
// Always find the LATEST cpuprofile file and patch that one into the devtools hint HTML page in /support/
//

const fs = require('fs');
const path = require('path');

let arg = fs.readdirSync(path.join(__dirname, '..')).filter(fn => fn.endsWith('.cpuprofile'));
if (arg.length > 0) {
	// sort latest to oldest:
  arg.sort(function (a, b) {
    const aa = a.split('.');
    const ba = b.split('.');
    for (let i = 1; i <= 5; i++) {
      if (!isNaN(aa[i])) {
        aa[i] = +aa[i];
      }
      if (!isNaN(ba[i])) {
        ba[i] = +ba[i];
      }
    }
    let diff = 0;
		// length+1 as counter limit so we can correctly compare against *longer* b sequences:
    for (let i = 0; diff === 0 && i < aa.length + 1; i++) {
      const ax = (aa[i] == null ? '' : aa[i]);
      const bx = (ba[i] == null ? '' : ba[i]);
      if (Number.isFinite(ax)) {
        diff = bx - ax;
        if (!Number.isFinite(diff)) {
          diff = bx.localeCompare(ax);
        }
      } else {
        diff = bx.localeCompare(ax);
      }
    }
    return diff;
  });
  arg = arg[0];
} else {
  arg = '???';
}
if (!arg.includes('cpuprofile')) {
  throw new Error('expected *.CPUPROFILE file as commandline argument');
}
if (!fs.existsSync(arg)) {
  throw new Error(`File '${arg}' does not exist?!`);
}
arg = path.resolve(arg);

const fn = path.join(__dirname, 'profile-devtools.html');
const src = fs.readFileSync(fn, 'utf8');
const dst = src.replace(/<pre>[\s\S]*<\/pre>/g, `<pre>${arg}</pre>`);
if (dst !== src) {
  fs.writeFileSync(fn, dst, 'utf8');
  console.log(`Updated HTML file ( reference: ${arg} )`);
} else {
  console.log('Nothing to change');
}


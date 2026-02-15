const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'index.html');
let s = fs.readFileSync(file, 'utf8');

// Mojibake: UTF-8 bytes misinterpreted as Windows-1252
// — (U+2014) UTF-8 E2 80 94 → â € " (U+00E2 U+20AC U+201C)
// – (U+2013) UTF-8 E2 80 93 → â € " (U+00E2 U+20AC U+2013) - actually 0x93 in CP1252 is '
// ' (U+2019) UTF-8 E2 80 99 → â € ™ (U+00E2 U+20AC U+2122) - no, 0x99 in CP1252 is ™. So â€™
// • (U+2022) UTF-8 E2 80 A2 → â € ¢ (U+00E2 U+20AC U+00A2)
// … (U+2026) UTF-8 E2 80 A6 → â € ¦ (U+00E2 U+20AC U+00A6)
// → (U+2192) UTF-8 E2 86 92 → â † ' (U+00E2 U+2190 U+2019) - 0x92 in CP1252 is '
// Em dash:
s = s.replace(/\u00E2\u20AC\u201C/g, '\u2014');
// En dash (range):
s = s.replace(/\u00E2\u20AC\u2013/g, '\u2013');
// Right single quote:
s = s.replace(/\u00E2\u20AC\u2122/g, '\u2019');
s = s.replace(/\u00E2\u20AC\u2019/g, '\u2019');
// Bullet • (E2 80 A2):
s = s.replace(/\u00E2\u0080\u00A2/g, '\u2022');
s = s.replace(/\u00E2\u20AC\u00A2/g, '\u2022');
// Ellipsis … (E2 80 A6):
s = s.replace(/\u00E2\u20AC\u00A6/g, '\u2026');
s = s.replace(/\u00E2\u0080\u00A6/g, '\u2026');
// Arrow → (E2 86 92):
s = s.replace(/\u00E2\u201A\u2019/g, '\u2192');
s = s.replace(/\u00E2\u2190\u2019/g, '\u2192');

// Emoji mojibake - literal strings as they appear in file
s = s.replace(/\u00F0\u009F\u0094\u0092/g, '\uD83D\uDD12'); // 🔒
s = s.replace(/\u00F0\u009F\u0094\u0093/g, '\uD83D\uDD13'); // 🔓
s = s.replace(/\u00F0\u009F\u0093\u00A7/g, '\uD83D\uDCE7'); // 📧
s = s.replace(/\u00F0\u009F\u0093\u008B/g, '\uD83D\uDCCB'); // 📋
s = s.replace(/\u00F0\u009F\u0092\u00BE/g, '\uD83D\uDCFE'); // 💾
s = s.replace(/\u00F0\u009F\u0093\u00A5/g, '\uD83D\uDCE5'); // 📥
s = s.replace(/\u00F0\u009F\u009A\u00A8/g, '\uD83D\uDEA8'); // 🚨
s = s.replace(/\u00F0\u009F\u0092\u00A1/g, '\uD83D\uDCA1'); // 💡
// Warning ⚠️ and ℹ️ - try common mojibake
s = s.replace(/\u00E2\u009A\u00A0\u00EF\u00B8\u008F/g, '\u26A0\uFE0F');
s = s.replace(/\u00E2\u0080\u00AA\u00EF\u00B8\u008F/g, '\u2139\uFE0F');

fs.writeFileSync(file, s, { encoding: 'utf8' });
console.log('Encoding fixes applied.');

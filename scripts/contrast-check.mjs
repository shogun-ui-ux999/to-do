// WCAG contrast check for the Tally Apple palette (PROMPT 6.1).
// Run with: bun scripts/contrast-check.mjs
//
// The `checks` list and token values below are exactly the ones from the
// PROMPT 6.1 spec. The "before" table reuses the same math against the
// tokens those values replaced, so every changed pair gets a
// before → after ratio. Exits non-zero if any pair fails its minimum.

const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const over = (fg, a, bg) => fg.map((c, i) => Math.round(a * c + (1 - a) * bg[i])); // alpha composite
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

const DARK = {
  bg: '#000000', surface: '#1C1C1E', surface2: '#2C2C2E',
  label: '#FFFFFF',
  label2: [235, 235, 245, 0.60],       // passes on all dark surfaces
  placeholder: [235, 235, 245, 0.55],  // was tertiary 0.30 → 2.25 FAIL
  accent: '#0A84FF',                   // text/icons/focus
  accentFill: '#0A6FD8',               // was #0A84FF → white text 3.65 FAIL
  danger: '#FF453A', success: '#30D158',
};
const LIGHT = {
  bg: '#FFFFFF', surface: '#F2F2F7',
  label: '#000000',
  label2: [60, 60, 67, 0.75],          // was 0.60 → 3.44 FAIL
  placeholder: [60, 60, 67, 0.75],     // was tertiary 0.30 → 1.73 FAIL
  accent: '#0062CC',                   // was #007AFF → 4.02 FAIL (text + fill)
  danger: '#D70015',                   // was #FF3B30 → 3.55 FAIL
  success: '#1E7A33',                  // was #34C759 → 2.22 FAIL
};

const checks = [
  // [label, foreground, background, minimum]
  ['dark  · label on bg',              DARK.label,        DARK.bg,        4.5],
  ['dark  · secondary on bg',          DARK.label2,       DARK.bg,        4.5],
  ['dark  · secondary on surface',     DARK.label2,       DARK.surface,   4.5],
  ['dark  · secondary on surface-2',   DARK.label2,       DARK.surface2,  4.5],
  ['dark  · placeholder on surface-2', DARK.placeholder,  DARK.surface2,  4.5],
  ['dark  · accent text on bg',        DARK.accent,       DARK.bg,        4.5],
  ['dark  · white on accent fill',     '#FFFFFF',         DARK.accentFill, 4.5],
  ['dark  · danger text on bg',        DARK.danger,       DARK.bg,        4.5],
  ['dark  · success text on bg',       DARK.success,      DARK.bg,        4.5],
  ['dark  · focus ring on surface-2',  DARK.accent,       DARK.surface2,  3.0],
  ['light · label on bg',              LIGHT.label,       LIGHT.bg,       4.5],
  ['light · secondary on bg',          LIGHT.label2,      LIGHT.bg,       4.5],
  ['light · secondary on surface',     LIGHT.label2,      LIGHT.surface,  4.5],
  ['light · placeholder on bg',        LIGHT.placeholder, LIGHT.bg,       4.5],
  ['light · placeholder on surface',   LIGHT.placeholder, LIGHT.surface,  4.5],
  ['light · accent text on bg',        LIGHT.accent,      LIGHT.bg,       4.5],
  ['light · accent text on surface',   LIGHT.accent,      LIGHT.surface,  4.5],
  ['light · white on accent fill',     '#FFFFFF',         LIGHT.accent,   4.5],
  ['light · danger text on bg',        LIGHT.danger,      LIGHT.bg,       4.5],
  ['light · success text on bg',       LIGHT.success,     LIGHT.bg,       4.5],
];

// Tokens that PROMPT 6.1 replaced, keyed by check label.
// alpha: the old translucent foreground. fg: the old solid foreground.
const BEFORE = {
  'dark  · placeholder on surface-2': { alpha: [235, 235, 245, 0.30], bg: DARK.surface2 },
  'dark  · white on accent fill':     { fg: '#FFFFFF', bg: '#0A84FF' },
  'light · secondary on bg':          { alpha: [60, 60, 67, 0.60], bg: LIGHT.bg },
  'light · secondary on surface':     { alpha: [60, 60, 67, 0.60], bg: LIGHT.surface },
  'light · placeholder on bg':        { alpha: [60, 60, 67, 0.30], bg: LIGHT.bg },
  'light · placeholder on surface':   { alpha: [60, 60, 67, 0.30], bg: LIGHT.surface },
  'light · accent text on bg':        { fg: '#007AFF', bg: LIGHT.bg },
  'light · accent text on surface':   { fg: '#007AFF', bg: LIGHT.surface },
  'light · white on accent fill':     { fg: '#FFFFFF', bg: '#007AFF' },
  'light · danger text on bg':        { fg: '#FF3B30', bg: LIGHT.bg },
  'light · success text on bg':       { fg: '#34C759', bg: LIGHT.bg },
};

function evaluate(useBefore = false) {
  return checks.map(([label, fg, bg, min]) => {
    const bgRgb = hex(bg);
    const fgRgb = Array.isArray(fg) ? over(fg.slice(0, 3), fg[3], bgRgb) : hex(fg);
    const value = ratio(fgRgb, bgRgb);

    let before = null;
    const old = useBefore ? BEFORE[label] : undefined;
    if (old) {
      const bgRgbOld = hex(old.bg);
      const fgRgbOld = old.alpha
        ? over(old.alpha.slice(0, 3), old.alpha[3], bgRgbOld)
        : hex(old.fg);
      before = ratio(fgRgbOld, bgRgbOld);
    }
    return { label, min, value, before };
  });
}

const rows = evaluate();
const beforeRows = evaluate(true);

console.log('After (final tokens):\n');
for (const { label, min, value } of rows) {
  console.log(`${value >= min ? 'PASS' : 'FAIL'}  ${value.toFixed(2).padStart(6)}:1  ${label}`);
}

console.log('\nChanged pairs — before → after:\n');
for (const row of beforeRows) {
  if (row.before === null) continue;
  const verdict = row.value >= row.min ? 'PASS' : 'FAIL';
  console.log(
    `${row.before.toFixed(2).padStart(6)}:1 → ${row.value.toFixed(2).padStart(6)}:1  (was ${row.before >= row.min ? 'PASS' : 'FAIL'})  ${verdict}  ${row.label}`
  );
}

const failures = rows.filter((row) => row.value < row.min).length;
console.log(`\n${rows.length - failures}/${rows.length} pairs pass; ${failures} fail.`);
process.exitCode = failures > 0 ? 1 : 0;

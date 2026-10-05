// Regression checks for PROMPT 7 (functionality / state bug fixes).
// Run with: bun scripts/regression-check.mjs
//
// Each assertion maps to a bug that was fixed in this pass:
//   1. Dark-theme tokens used `::root[...]`, which browsers never match, so
//      the whole dark palette was dead. Must stay `:root[...]`.
//   2. `rounded-20` is used by the landing page but `--radius-20` was never
//      defined, so Tailwind emitted no utility for it.
//   3. TaskRow's edit UI had a `type="submit"` Save button outside any
//      <form>, making Save (and Enter) dead controls.
//   4. AddTaskForm had no in-flight guard against duplicate submits.
//   5. safeReturnTo must never send an authenticated visitor back to /auth
//      (stranded on the loading spinner forever).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const checks = [];
const check = (label, ok) => checks.push({ label, ok });

// ---- 1 + 2: theme selectors and radius token ----
const css = read("src/index.css");
check(
  "index.css: dark theme selector is :root[data-theme=\"dark\"]",
  css.includes(':root[data-theme="dark"]')
);
check(
  "index.css: no invalid ::root selectors remain",
  !css.includes("::root")
);
check(
  "index.css: --radius-20 token defined (used by rounded-20)",
  css.includes("--radius-20:")
);

// ---- 3: TaskRow edit form wiring ----
const taskRow = read("src/pages/dashboard/task-row.tsx");
check(
  "task-row: edit UI submits through a real <form onSubmit={handleSave}>",
  /<form[\s\S]*?onSubmit=\{handleSave\}/.test(taskRow)
);
check(
  "task-row: Save button reports pending state (Saving…)",
  taskRow.includes('saving ? "Saving…"')
);

// ---- 4: AddTaskForm in-flight guard ----
const addForm = read("src/pages/dashboard/add-task-form.tsx");
check(
  "add-task-form: duplicate submits guarded while pending",
  addForm.includes("if (submitting) {")
);
check(
  "add-task-form: submit button disabled while pending",
  addForm.includes("disabled={submitting}")
);

// ---- 5: returnTo redirect guard ----
const { safeReturnTo } = await import(
  join(root, "src/pages/auth/auth-page.tsx")
);
const returnCases = [
  [null, "/app"],
  ["/app", "/app"],
  ["/app?tab=1", "/app?tab=1"],
  ["//evil.example", "/app"],
  ["https://evil.example", "/app"],
  ["/auth", "/app"],
  ["/auth?action=signup", "/app"],
  ["/auth#anchor", "/app"],
];
for (const [input, expected] of returnCases) {
  const actual = safeReturnTo(input);
  check(
    `safeReturnTo(${JSON.stringify(input)}) === ${JSON.stringify(expected)}`,
    actual === expected
  );
}

// ---- report ----
let failures = 0;
for (const { label, ok } of checks) {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
}
console.log(
  `\n${checks.length - failures}/${checks.length} checks pass; ${failures} fail.`
);
process.exitCode = failures > 0 ? 1 : 0;

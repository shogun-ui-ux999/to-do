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
//   6. applyTheme left <meta name="theme-color"> untouched, so switching the
//      theme in-app kept the old browser-chrome colour until a reload.
//   7. The auth forms had no in-flight guard and no bounded recovery: if the
//      request settled but the session never flipped, the disabled submit
//      button trapped the user with no way back.
//   8. Convex speaks over a WebSocket. With that socket down a sign-in/up
//      request never settles, so the forms now check the connection up front
//      and fail fast instead of hanging until the watchdog fires.
//   9. Hosting does not inject VITE_CONVEX_URL into the client bundle, so the
//      app fell back to 127.0.0.1 — the visitor's own machine — and account
//      creation failed everywhere. The deployed Convex Cloud backend is now
//      the default, and the forms still avoid blaming the visitor's connection.

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
  // Anchored so `::root[data-theme=...]` — which browsers never match — can’t
  // satisfy it by substring.
  "index.css: dark theme selector is :root[data-theme=\"dark\"]",
  /^\s*:root\[data-theme="dark"\]\s*\{/m.test(css)
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

// ---- 6: theme-color stays in sync when the theme is applied at runtime ----
const theme = read("src/lib/theme.ts");
check(
  "theme: applyTheme updates <meta name=\"theme-color\">",
  theme.includes('meta[name="theme-color"]') &&
    /applyTheme[\s\S]*?applyThemeColor\(theme\)/.test(theme)
);

// ---- 7: auth form in-flight guard + bounded recovery ----
for (const form of ["src/pages/auth/signin-form.tsx", "src/pages/auth/signup-form.tsx"]) {
  const source = read(form);
  check(
    `${form}: duplicate submits guarded while pending`,
    source.includes("if (submitting) {")
  );
  check(
    `${form}: pending submit has a bounded watchdog (setTimeout)`,
    /window\.setTimeout\([\s\S]*?setSubmitting\(false\)/.test(source)
  );
  check(
    `${form}: watchdog cleared when the request fails`,
    source.includes("window.clearTimeout(watchdog)")
  );
}

// ---- 8: auth forms fail fast when the Convex socket is down ----
for (const form of ["src/pages/auth/signin-form.tsx", "src/pages/auth/signup-form.tsx"]) {
  const source = read(form);
  check(
    `${form}: reads the Convex connection state`,
    source.includes("useConvexConnectionState") &&
      source.includes("isWebSocketConnected")
  );
  check(
    // The guard widened to `!backendConfigured || !isWebSocketConnected`; what
    // matters is that nothing is submitted before it returns.
    `${form}: refuses to submit while offline (guard before submitting)`,
    /if \(![A-Za-z]+ \|\| !isWebSocketConnected\) \{[\s\S]*?return;[\s\S]*?setSubmitting\(true\)/.test(
      source
    )
  );
}

// ---- 9: the deployed backend must be the default, not a localhost fallback --
// Hosting builds without injecting VITE_CONVEX_URL into the client bundle, so
// a config-only app shipped with 127.0.0.1 — the visitor's own machine — and
// every account creation failed.
const convexConfig = read("src/lib/convex-config.ts");
check(
  "convex-config: defaults to the deployed Convex Cloud backend",
  /const DEPLOYED_BACKEND = "https:\/\/[a-z0-9-]+\.convex\.cloud"/.test(
    convexConfig
  ) &&
    convexConfig.includes("return { url: DEPLOYED_BACKEND, configured: true };")
);
check(
  "convex-config: never falls back to the visitor's own 127.0.0.1",
  !convexConfig.includes("127.0.0.1:3210")
);
check(
  "convex-config: exports isBackendConfigured()",
  convexConfig.includes("export function isBackendConfigured()")
);
check(
  "convex: client is built from resolveConvexUrl (no window at import in the forms)",
  /new ConvexReactClient\(resolveConvexUrl\(\)\.url\)/.test(read("src/lib/convex.ts"))
);
for (const form of ["src/pages/auth/signin-form.tsx", "src/pages/auth/signup-form.tsx"]) {
  const source = read(form);
  check(
    `${form}: branches on backendConfigured before blaming the connection`,
    /if \(!backendConfigured \|\| !isWebSocketConnected\) \{[\s\S]*?backendConfigured\s*\?/.test(
      source
    ) &&
      source.includes(
        'import { isBackendConfigured } from "~/lib/convex-config";'
      )
  );
  check(
    `${form}: says accounts are unavailable when unconfigured`,
    source.includes("temporarily unavailable")
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

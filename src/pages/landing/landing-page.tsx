import { Link } from "react-router";
import { motion } from "framer-motion";
import { Check, ListOrdered, Undo2, Lock, CalendarDays } from "lucide-react";
import { Button } from "~/lib/components/ui/button";

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={
        "flex h-8 w-8 items-center justify-center rounded-md bg-accent text-on-accent " +
        (className ?? "")
      }
      aria-hidden="true"
    >
      <Check className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}

function formatDate(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month, day));
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${weekdays[date.getUTCDay()]}, ${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function LandingPage() {
  const today = new Date();
  const todayString = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none"
          >
            <BrandMark />
            <span className="font-display text-lg font-semibold tracking-tight">
              Tally
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?action=signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero — one serif line, exact date, single primary action. */}
        <section className="border-b border-border/60">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-block text-xs font-medium tracking-[0.12em] uppercase text-muted"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                The daily task journal
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
                className="mt-5 font-display text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              >
                Write it down.
                <br />
                Finish it.
                <span className="text-accent"> Forgot the rest.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16, ease: "easeOut" }}
                className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
              >
                One list, ordered so the next thing is always on top — ranked by
                what&apos;s due, protected by a five-second undo, and locked to
                your account alone.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.24, ease: "easeOut" }}
                className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Button size="lg" asChild>
                  <Link to="/auth?action=signup">Create your account</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/auth">I already have one</Link>
                </Button>
              </motion.div>
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted"
              >
                {[
                  "Email + password",
                  "Undo every delete",
                  "Your data stays yours",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              aria-hidden="true"
            >
              <div className="rounded-md border border-border bg-surface p-4 shadow-sm sm:p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold">Your list</p>
                  <p className="text-xs text-muted">{todayString}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-bg p-2">
                  <span className="flex-1 rounded-md bg-surface px-3 py-2 text-sm text-muted">
                    Add a task…
                  </span>
                  <span className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs text-muted sm:flex">
                    <CalendarDays className="h-3.5 w-3.5" /> Due
                  </span>
                  <span className="rounded-md bg-accent px-3 py-2 text-xs font-medium text-on-accent">
                    Add
                  </span>
                </div>

                <div className="mt-3 flex gap-1.5">
                  <span className="rounded-md bg-text px-3 py-1 text-xs font-medium text-bg">
                    All 3
                  </span>
                  <span className="rounded-md border border-border bg-surface px-3 py-1 text-xs text-muted">
                    Active 2
                  </span>
                  <span className="rounded-md border border-border bg-surface px-3 py-1 text-xs text-muted">
                    Done 1
                  </span>
                </div>

                <ul className="mt-3 space-y-0">
                  {[
                    { title: "Send the quarterly recap", due: "Today", done: false },
                    { title: "Book the dentist appointment", due: null, done: true },
                    { title: "Draft Q4 goals", due: "Tomorrow", done: false },
                  ].map((row) => (
                    <li
                      key={row.title}
                      className="flex items-start gap-3 py-3"
                    >
                      <span
                        className={
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors " +
                          (row.done
                            ? "border-accent bg-accent text-on-accent"
                            : "border-border bg-surface")
                        }
                      >
                        {row.done && (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={
                            "text-sm leading-6 " +
                            (row.done ? "text-muted line-through" : "text-text")
                          }
                        >
                          {row.title}
                        </p>
                        {row.due !== null && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                            {row.due}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features — one per column, no cards, no icons, just type. */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Three ideas, held to the letter.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "One list, ranked for you",
                  body:
                    "Unfinished tasks rise to the top, earliest due dates come first, and new items never bury old ones.",
                },
                {
                  number: "02",
                  title: "Five seconds of grace",
                  body:
                    "Delete the wrong row and the undo bar gives you a full five seconds to put it back, exactly where it was.",
                },
                {
                  number: "03",
                  title: "Locked to you",
                  body:
                    "Every read and write is checked against your account on the server. Nobody else can see, edit, or delete a single task.",
                },
              ].map(({ number, title, body }) => (
                <div
                  key={title}
                  className="relative pt-6"
                >
                  <span className="font-display text-5xl font-semibold leading-none text-muted/40">
                    {number}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ordering explainer — a numbered list, not a matrix. */}
        <section className="border-b border-border/60">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                The list decides what&apos;s next.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
                No drag-and-drop rituals, no priority matrix. Tally applies one
                rule every time you open it, so the top of the list is always
                the thing worth doing.
              </p>
              <ol className="mt-8 space-y-5">
                {[
                  [
                    "Unfinished first",
                    "Checked-off tasks sink to the bottom, out of your way.",
                  ],
                  [
                    "Soonest due date next",
                    "Dated items climb above undated ones as their date nears.",
                  ],
                  [
                    "Newest breaks the tie",
                    "Same day? The thing you just wrote sits on top.",
                  ],
                ].map(([title, body], index) => (
                  <li key={title}>
                    <div className="flex items-start gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface font-display text-sm font-semibold text-muted">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-0.5 text-sm text-muted">{body}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <OrderingPreview />
          </div>
        </section>

        {/* Closing call to action — one message, one primary action. */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="rounded-md border border-border bg-text px-6 py-10 text-bg sm:px-12 lg:py-14">
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with an empty list. It fills itself.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-bg/70 sm:text-base">
              Create an account in under a minute. No notifications, no sharing,
              no settings to wander through — just your tasks, in order.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/auth?action=signup">Get started</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-bg hover:bg-bg/10"
                asChild
              >
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-muted sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-6 w-6" />
            <span className="font-display text-sm font-semibold text-text">
              Tally
            </span>
          </div>
          <p>Built with React, Convex and Tailwind CSS.</p>
          <div className="flex gap-4">
            <Link
              to="/auth"
              className="rounded focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none"
            >
              Sign in
            </Link>
            <Link
              to="/auth?action=signup"
              className="rounded focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none"
            >
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Static, decorative preview of the workspace shown in the hero. */
function OrderingPreview() {
  const steps = [
    { label: "Renew passport", note: "Due Sep 30 · unfinished", tone: "accent" },
    { label: "Draft Q4 goals", note: "Due Oct 12 · unfinished", tone: "plain" },
    { label: "Water the plants", note: "No due date · unfinished", tone: "plain" },
    { label: "Book dentist", note: "Finished · sinks below", tone: "done" },
  ];
  return (
    <div className="rounded-md border border-border bg-surface p-5 shadow-sm">
      <p className="text-xs font-medium tracking-[0.1em] uppercase text-muted">
        What the top of your list looks like
      </p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={
              "flex items-center gap-3 rounded-md border p-3 " +
              (step.tone === "accent"
                ? "border-accent/40 bg-accent/5"
                : "border-border")
            }
          >
            <span className="w-4 text-xs font-semibold text-muted tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={
                  "truncate text-sm " +
                  (step.tone === "done"
                    ? "text-muted line-through"
                    : "font-medium text-text")
                }
              >
                {step.label}
              </p>
              <p className="text-xs text-muted">{step.note}</p>
            </div>
            {step.tone === "accent" && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-on-accent">
                Next
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

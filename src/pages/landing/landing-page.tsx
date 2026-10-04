import { Link } from "react-router";
import { Check, CalendarDays, ArrowRight, Lightbulb, Users } from "lucide-react";
import { Button } from "~/lib/components/ui/button";
import { Input } from "~/lib/components/ui/input";
import { Checkbox } from "~/lib/components/ui/checkbox";

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={
        "flex h-8 w-8 items-center justify-center rounded-md bg-accent-fill text-on-accent " +
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

function FeatureTile({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Lightbulb;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-10 border border-separator bg-surface p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent/70" />
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-fill/10 text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-base font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-label-secondary">
          {body}
        </p>
      </div>
    </div>
  );
}

function AppPreview() {
  const now = new Date();
  const today = formatDate(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return (
    <section className="rounded-10 border border-separator bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold tracking-tight">
          Your list
        </p>
        <p className="text-xs text-label-tertiary">{today}</p>
      </div>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="mt-4 flex items-center gap-2 rounded-md border border-separator bg-bg p-3"
      >
        <Input
          placeholder="Add a task…"
          className="h-10 flex-1 bg-transparent px-0 text-sm"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Add
        </Button>
      </form>

      <div className="mt-3 flex gap-1.5">
        <Button
          variant="primary"
          size="sm"
          className="rounded-10 bg-accent-fill px-3 py-2 text-xs font-medium"
        >
          All
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-10 bg-surface px-3 py-2 text-xs font-medium"
        >
          Active
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-10 bg-surface px-3 py-2 text-xs font-medium"
        >
          Done
        </Button>
      </div>

      <ul className="mt-3 space-y-0">
        {[
          { title: "Send the quarterly recap", due: "Today" },
          { title: "Book the dentist appointment", due: "Tomorrow" },
          { title: "Draft Q4 goals", due: "Today" },
        ].map((item, index) => (
          <li key={item.title} className="flex items-start gap-3 py-2">
            <span
              className={
                index === 1
                  ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-fill text-on-accent"
                  : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-separator bg-surface"
              }
            >
              {index === 1 && (
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-6 text-label">{item.title}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-label-tertiary">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Due {item.due}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2 text-xs text-label-tertiary">
        <span className="h-2 w-2 rounded-full bg-accent/70" />
        Live · three tasks · synced to your account
      </div>
    </section>
  );
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
      <header className="sticky top-0 z-20 border-b border-separator bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none"
          >
            <BrandMark />
            <span className="font-display text-lg font-semibold tracking-tight">
              Tally
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?action=signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-10">
        <section className="border-b border-separator pb-10">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium tracking-[0.14em] uppercase text-label-tertiary">
              The daily task journal
            </p>
            <p className="text-xs text-label-tertiary">{todayString}</p>
          </div>

          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-label">
            One list, ordered so the next thing is always on top.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-label-secondary">
            Tally ranks your list by what&apos;s due, protects every delete with
            five seconds of undo, and keeps each task locked to your account on
            the server.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/auth?action=signup">Create your account</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">I already have one</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-label-tertiary">
            {[
              "Email + password",
              "Five seconds of undo after every delete",
              "Your data stays yours",
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-separator pb-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            How Tally stays out of your way
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <FeatureTile
              icon={Lightbulb}
              title="One list, ordered by what&apos;s due"
              body="Unfinished tasks rise to the top. Earliest due dates come next, and new items never bury older ones."
            />
            <FeatureTile
              icon={Check}
              title="Five seconds of grace"
              body="Deleted the wrong row? The undo banner gives you a full five seconds to put it back, exactly where it was."
            />
            <FeatureTile
              icon={Users}
              title="Locked to you"
              body="Every read and write is checked against your account on the server, so nobody else can see, edit, or delete a single task."
            />
          </div>
        </section>

        <section className="border-b border-separator pb-10">
          <AppPreview />
        </section>

        <section className="border-b border-separator pb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Sign in. Pick up exactly where you left off.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-label-secondary">
                One account. One list. No settings to wander through.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link to="/auth?action=signup">
                Create your account
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-separator">
        <div className="mx-auto flex max-w-2xl flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-label-tertiary sm:flex-row sm:items-center sm:px-4">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-6 w-6" />
            <span className="font-display text-sm font-semibold text-label">
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

export default LandingPage;

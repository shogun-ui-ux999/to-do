/* Shared class sets for the Apple UI. Every class here maps to a semantic
 * token defined in src/index.css, so no raw color appears in component code. */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Solid fills use accent-fill (darker blue) so white labels keep contrast in
 * both themes; text, icons and focus rings use the lighter accent token. */
export const buttonVariants = {
  primary:
    "bg-accent-fill text-on-accent hover:bg-accent-hover focus-visible:ring-accent",
  secondary:
    "bg-surface text-label border border-separator hover:bg-surface-2 focus-visible:ring-accent",
  ghost: "text-label hover:bg-surface-2 focus-visible:ring-accent",
  ghostInverted: "text-label hover:bg-surface-2 focus-visible:ring-accent",
  link: "text-accent underline-offset-4 hover:underline focus-visible:ring-accent",
  danger:
    "bg-danger text-on-danger hover:bg-danger-hover focus-visible:ring-danger",
} as const;

/** Segmented control: the track is surface, the selected segment pops to
 * surface-3 (white in light, #3a3a3c in dark) with label-colored text. */
export const segmentedVariants = {
  item: "inline-flex items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none",
  active: "bg-surface-3 text-label",
  inactive: "text-label-secondary hover:text-label",
} as const;

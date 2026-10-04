import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Buttons. Flat, 6px radius, ink-on-paper until the primary action which is
 * vermilion. No shadows, no gradients — depth comes from the hairline border
 * and the ring on focus.
 */
export const buttonVariants = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hover focus-visible:ring-accent",
  secondary:
    "bg-surface text-text border border-border hover:bg-surface-2 focus-visible:ring-accent",
  ghost: "text-text hover:bg-surface-2 focus-visible:ring-accent",
  ghostInverted:
    "text-text hover:bg-surface-2 focus-visible:ring-accent",
  link: "text-accent underline-offset-4 hover:underline focus-visible:ring-accent",
  danger:
    "bg-danger text-on-accent hover:bg-danger-hover focus-visible:ring-danger",
};

/**
 * Tabs. Text-only with a small count numeral; the active tab shows a hairline
 * underline. The vermilion underline is the only accent on the page.
 */
export const tabVariants = {
  default:
    "relative px-3 py-1.5 text-sm font-medium transition-colors duration-180 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none",
  active:
    "border-0 bg-surface text-text", // hairline below via a separate span
};

/**
 * Free variants for semantic, restrained accents. One accent per screen —
 * primary action, focus ring, or active state.
 */
export const fieldVariants = {
  success:
    "text-success-ink",
  danger:
    "text-danger",
};

export const LABEL = {
  task: "task",
} as const;

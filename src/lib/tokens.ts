import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = {
  primary:
    "bg-accent text-on-accent shadow-sm hover:bg-accent-hover focus-visible:ring-accent",
  secondary:
    "bg-surface text-text border border-border hover:bg-surface-2 focus-visible:ring-accent",
  ghost: "text-text hover:bg-surface-2 focus-visible:ring-accent",
  link: "text-accent underline-offset-4 hover:underline focus-visible:ring-accent",
  danger:
    "bg-danger text-on-accent shadow-sm hover:bg-danger-hover focus-visible:ring-danger",
};

export const LABEL = {
  task: "task",
} as const;

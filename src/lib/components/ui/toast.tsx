import { Toaster as HotToaster, toast as hotToast } from "react-hot-toast";

export { hotToast as toast };

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--color-surface)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          maxWidth: "24rem",
          boxShadow:
            "0 2px 4px rgb(34 37 32 / 0.06), 0 18px 48px -24px rgb(34 37 32 / 0.4);",
        },
      }}
    />
  );
}

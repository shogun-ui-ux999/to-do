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
          boxShadow: "var(--shadow-float)",
          fontSize: "0.875rem",
          maxWidth: "24rem",
        },
      }}
    />
  );
}

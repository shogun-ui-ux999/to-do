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
          color: "var(--color-label)",
          border: "1px solid var(--color-separator)",
          borderRadius: "10px",
          padding: "10px 14px",
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          maxWidth: "24rem",
          boxShadow: "var(--shadow-10)",
        },
      }}
    />
  );
}

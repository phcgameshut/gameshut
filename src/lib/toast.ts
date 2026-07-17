export const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
  if (typeof window !== "undefined" && (window as any).showToast) {
    (window as any).showToast(message, type);
  } else {
    console.log(`[Toast Fallback] ${type}: ${message}`);
  }
};

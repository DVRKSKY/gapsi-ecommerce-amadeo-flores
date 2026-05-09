export function trackEvent(name: string, payload?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", name, payload);
  }
}

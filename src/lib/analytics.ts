export type AnalyticsEvent = {
  name: string;
  payload?: Record<string, unknown>;
  timestamp: number;
};

type Listener = (event: AnalyticsEvent) => void;

const listeners = new Set<Listener>();

export const trackEvent = (name: string, payload?: Record<string, unknown>) => {
  const event: AnalyticsEvent = { name, payload, timestamp: Date.now() };

  if (process.env.NODE_ENV !== 'production') {
    // Surface events locally without needing an external analytics vendor.
    // eslint-disable-next-line no-console
    console.info('[analytics]', name, payload ?? {});
  }

  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      // Keep individual listener failures from breaking the rest.
      console.error('Analytics listener error', error);
    }
  });
};

export const subscribeToAnalytics = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

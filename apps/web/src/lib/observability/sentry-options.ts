import { scrubEvent } from "./scrub-event";

/**
 * Error tracking settings shared by the browser, server and edge runtimes.
 * Privacy first: no personal data, no breadcrumbs, no performance traces,
 * no session replay, and every error passes through scrubEvent.
 */
export function sentryOptions(dsn: string, environment: string) {
  return {
    dsn,
    environment,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeBreadcrumb: () => null,
    beforeSendTransaction: () => null,
    beforeSend: scrubEvent,
  } as const;
}

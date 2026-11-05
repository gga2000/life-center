import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Privacy filter for every error report that leaves the app.
 *
 * Health and money values must never reach error tracking, so this keeps only
 * what is needed to find the bug (the error, the stack, the page path, the
 * device type) and drops everything that could carry user data.
 */

type RequestData = NonNullable<ErrorEvent["request"]>;
type Exception = NonNullable<NonNullable<ErrorEvent["exception"]>["values"]>[number];

/** Contexts that describe the device and runtime only, never the user. */
const SAFE_CONTEXTS = new Set(["app", "browser", "culture", "device", "os", "runtime", "trace"]);

export function stripQueryAndHash(url: string): string {
  const cut = url.search(/[?#]/);
  return cut === -1 ? url : url.slice(0, cut);
}

function scrubRequest(request: RequestData): RequestData {
  const safe: RequestData = {};
  if (request.method !== undefined) {
    safe.method = request.method;
  }
  if (request.url !== undefined) {
    safe.url = stripQueryAndHash(request.url);
  }
  return safe;
}

function scrubException(exception: Exception): Exception {
  const frames = exception.stacktrace?.frames;
  if (exception.stacktrace === undefined || frames === undefined) {
    return exception;
  }
  return {
    ...exception,
    stacktrace: {
      ...exception.stacktrace,
      frames: frames.map((frame) => {
        const withoutVars = { ...frame };
        delete withoutVars.vars;
        return withoutVars;
      }),
    },
  };
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const safe: ErrorEvent = { ...event };

  delete safe.user;
  delete safe.extra;
  delete safe.breadcrumbs;
  delete safe.server_name;

  if (event.request !== undefined) {
    safe.request = scrubRequest(event.request);
  }

  if (event.contexts !== undefined) {
    safe.contexts = Object.fromEntries(
      Object.entries(event.contexts).filter(([name]) => SAFE_CONTEXTS.has(name)),
    );
  }

  const values = event.exception?.values;
  if (values !== undefined) {
    safe.exception = { values: values.map(scrubException) };
  }

  return safe;
}

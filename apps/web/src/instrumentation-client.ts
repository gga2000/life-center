import * as Sentry from "@sentry/nextjs";
import { environmentName, publicEnv } from "./env/public";
import { sentryOptions } from "./lib/observability/sentry-options";

const dsn = publicEnv.NEXT_PUBLIC_SENTRY_DSN;
if (dsn !== undefined) {
  Sentry.init(sentryOptions(dsn, environmentName(publicEnv)));
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

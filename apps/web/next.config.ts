import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import { parseSourceMapUpload } from "./src/env/build";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  headers() {
    return Promise.resolve([{ source: "/:path*", headers: securityHeaders }]);
  },
};

const upload = parseSourceMapUpload({
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
});

export default withSentryConfig(nextConfig, {
  silent: process.env.CI === undefined,
  telemetry: false,
  widenClientFileUpload: true,
  ...(upload === null
    ? { sourcemaps: { disable: true } }
    : { authToken: upload.authToken, org: upload.org, project: upload.project }),
});

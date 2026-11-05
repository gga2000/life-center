import { z } from "zod";

/**
 * Build-time secrets. Read only by next.config.ts on the build machine.
 * Source map upload to Sentry needs all three values, or none of them.
 */
const sourceMapUploadSchema = z.union([
  z.object({
    SENTRY_AUTH_TOKEN: z.string().min(1),
    SENTRY_ORG: z.string().min(1),
    SENTRY_PROJECT: z.string().min(1),
  }),
  z.object({
    SENTRY_AUTH_TOKEN: z.undefined(),
    SENTRY_ORG: z.undefined(),
    SENTRY_PROJECT: z.undefined(),
  }),
]);

export type SourceMapUpload = { authToken: string; org: string; project: string } | null;

export function parseSourceMapUpload(source: {
  SENTRY_AUTH_TOKEN: string | undefined;
  SENTRY_ORG: string | undefined;
  SENTRY_PROJECT: string | undefined;
}): SourceMapUpload {
  const parsed = sourceMapUploadSchema.parse(source);
  if (parsed.SENTRY_AUTH_TOKEN === undefined) {
    return null;
  }
  return {
    authToken: parsed.SENTRY_AUTH_TOKEN,
    org: parsed.SENTRY_ORG,
    project: parsed.SENTRY_PROJECT,
  };
}

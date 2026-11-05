import { z } from "zod";

/**
 * Environment values that are safe to ship to the browser.
 * Next.js only inlines NEXT_PUBLIC_* values that are referenced literally,
 * so each one is read by name below. Never put a secret here.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  NEXT_PUBLIC_VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(source: Record<keyof PublicEnv, string | undefined>): PublicEnv {
  return publicEnvSchema.parse(source);
}

export const publicEnv: PublicEnv = parsePublicEnv({
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
});

/** Name of the running environment, as shown in error tracking. */
export function environmentName(env: PublicEnv): string {
  return env.NEXT_PUBLIC_VERCEL_ENV ?? "local";
}

import { describe, expect, it } from "vitest";
import { environmentName, parsePublicEnv } from "./public";
import { parseSourceMapUpload } from "./build";

describe("parsePublicEnv", () => {
  it("accepts a valid DSN and environment", () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_SENTRY_DSN: "https://key@o1.ingest.sentry.io/2",
      NEXT_PUBLIC_VERCEL_ENV: "production",
    });
    expect(env.NEXT_PUBLIC_SENTRY_DSN).toBe("https://key@o1.ingest.sentry.io/2");
    expect(environmentName(env)).toBe("production");
  });

  it("treats missing values as not configured", () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_SENTRY_DSN: undefined,
      NEXT_PUBLIC_VERCEL_ENV: undefined,
    });
    expect(env.NEXT_PUBLIC_SENTRY_DSN).toBeUndefined();
    expect(environmentName(env)).toBe("local");
  });

  it("rejects a DSN that is not a URL", () => {
    expect(() =>
      parsePublicEnv({ NEXT_PUBLIC_SENTRY_DSN: "not a url", NEXT_PUBLIC_VERCEL_ENV: undefined }),
    ).toThrow();
  });

  it("rejects an unknown environment name", () => {
    expect(() =>
      parsePublicEnv({ NEXT_PUBLIC_SENTRY_DSN: undefined, NEXT_PUBLIC_VERCEL_ENV: "staging" }),
    ).toThrow();
  });
});

describe("parseSourceMapUpload", () => {
  it("returns null when nothing is set", () => {
    expect(
      parseSourceMapUpload({
        SENTRY_AUTH_TOKEN: undefined,
        SENTRY_ORG: undefined,
        SENTRY_PROJECT: undefined,
      }),
    ).toBeNull();
  });

  it("returns the upload settings when all three are set", () => {
    expect(
      parseSourceMapUpload({ SENTRY_AUTH_TOKEN: "t", SENTRY_ORG: "o", SENTRY_PROJECT: "p" }),
    ).toEqual({ authToken: "t", org: "o", project: "p" });
  });

  it("fails loudly when only some are set", () => {
    expect(() =>
      parseSourceMapUpload({ SENTRY_AUTH_TOKEN: "t", SENTRY_ORG: undefined, SENTRY_PROJECT: "p" }),
    ).toThrow();
  });
});

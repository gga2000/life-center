import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";
import { scrubEvent, stripQueryAndHash } from "./scrub-event";

function eventWithPrivateData(): ErrorEvent {
  return {
    type: undefined,
    message: "Failed to save lab result",
    user: { id: "user-1", email: "someone@example.com", ip_address: "10.0.0.1" },
    extra: { ferritin: 12.4, unit: "ng/mL" },
    breadcrumbs: [{ category: "fetch", data: { body: '{"amount":125000}' } }],
    server_name: "host-abc",
    request: {
      method: "POST",
      url: "https://app.example.com/labs/new?marker=ferritin&value=12.4#notes",
      data: { value: 12.4 },
      cookies: { session: "secret-cookie" },
      headers: { authorization: "Bearer secret-token", "user-agent": "test" },
      query_string: "marker=ferritin&value=12.4",
    },
    contexts: {
      os: { name: "macOS" },
      browser: { name: "Chrome" },
      state: { state: { type: "redux", value: { draftValue: 12.4 } } },
      lab: { marker: "ferritin" },
    },
    exception: {
      values: [
        {
          type: "Error",
          value: "Failed to save lab result",
          stacktrace: {
            frames: [{ filename: "app.js", function: "save", vars: { value: "12.4" } }],
          },
        },
      ],
    },
  };
}

describe("scrubEvent", () => {
  it("removes user identity, extra data, breadcrumbs and host name", () => {
    const safe = scrubEvent(eventWithPrivateData());
    expect(safe.user).toBeUndefined();
    expect(safe.extra).toBeUndefined();
    expect(safe.breadcrumbs).toBeUndefined();
    expect(safe.server_name).toBeUndefined();
  });

  it("keeps only the request method and the path without query or hash", () => {
    const safe = scrubEvent(eventWithPrivateData());
    expect(safe.request).toEqual({ method: "POST", url: "https://app.example.com/labs/new" });
  });

  it("keeps device and runtime contexts but drops app state contexts", () => {
    const safe = scrubEvent(eventWithPrivateData());
    expect(Object.keys(safe.contexts ?? {}).sort()).toEqual(["browser", "os"]);
  });

  it("removes local variables from stack frames but keeps the stack", () => {
    const safe = scrubEvent(eventWithPrivateData());
    const frame = safe.exception?.values?.[0]?.stacktrace?.frames?.[0];
    expect(frame).toEqual({ filename: "app.js", function: "save" });
  });

  it("keeps the error message so the bug can be found", () => {
    const safe = scrubEvent(eventWithPrivateData());
    expect(safe.message).toBe("Failed to save lab result");
    expect(safe.exception?.values?.[0]?.value).toBe("Failed to save lab result");
  });

  it("never contains the private values anywhere in the report", () => {
    const serialized = JSON.stringify(scrubEvent(eventWithPrivateData()));
    for (const secret of [
      "12.4",
      "125000",
      "someone@example.com",
      "10.0.0.1",
      "secret-cookie",
      "secret-token",
      "ferritin",
      "host-abc",
    ]) {
      expect(serialized).not.toContain(secret);
    }
  });

  it("does not change the original event", () => {
    const original = eventWithPrivateData();
    scrubEvent(original);
    expect(original.user?.email).toBe("someone@example.com");
    expect(original.exception?.values?.[0]?.stacktrace?.frames?.[0]?.vars).toEqual({
      value: "12.4",
    });
  });
});

describe("stripQueryAndHash", () => {
  it.each([
    ["https://a.com/x", "https://a.com/x"],
    ["https://a.com/x?y=1", "https://a.com/x"],
    ["https://a.com/x#z", "https://a.com/x"],
    ["/labs?id=1#top", "/labs"],
  ])("%s -> %s", (input, expected) => {
    expect(stripQueryAndHash(input)).toBe(expected);
  });
});

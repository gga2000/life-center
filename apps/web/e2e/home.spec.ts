import { expect, test } from "@playwright/test";

test("home page loads without errors and is private", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      errors.push(`${String(response.status())} ${response.url()}`);
    }
  });

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Life Center" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  expect(errors).toEqual([]);
});

test("security headers are sent", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();

  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("no-referrer");
  expect(headers["x-robots-tag"]).toBe("noindex, nofollow");
  expect(headers["x-powered-by"]).toBeUndefined();
});

import { expect, test } from "@playwright/test";

test("public invitation exposes a live health endpoint", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toEqual({ status: "ok" });
});

test("admin keeps the direct-link generator public", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Generator Link" })).toBeVisible();
  await expect(page.getByLabel("Nama tamu")).toBeVisible();
});

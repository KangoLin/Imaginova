import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // App defaults to zh-CN; pin the en locale so the copy assertions apply.
  await page.context().addCookies([
    { name: "imaginova-locale", value: "en", url: "http://localhost:3000" },
  ]);
});

test("homepage loads and shows title", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Turn your ideas into reality");
  await expect(page.getByText("Sign In")).toBeVisible();
});

test("can navigate to login page", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Sign In").click();
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});

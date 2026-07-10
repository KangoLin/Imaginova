import { test, expect } from "@playwright/test";

test("homepage loads and shows title", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Turn your ideas");
  await expect(page.getByText("Get Started")).toBeVisible();
  await expect(page.getByText("Sign In")).toBeVisible();
});

test("can navigate to login page", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Sign In").click();
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("heading")).toContainText("Sign In");
});

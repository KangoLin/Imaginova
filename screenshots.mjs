import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const OUT = "C:\\Users\\xgame\\AppData\\Local\\Temp";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjYsImV4cCI6MTc4NTkwMzE5MX0.1ZwGKBnFo-mauT9w7-hBp_S6TqWAoCPhg-REhClvW3g";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{
    name: "token", value: TOKEN,
    domain: "localhost", path: "/",
    httpOnly: true, sameSite: "Lax"
  }]);
  const page = await ctx.newPage();

  await page.goto(`${BASE}/create`, { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  console.log("/create URL:", page.url());
  await page.screenshot({ path: `${OUT}\\imaginova-create.png`, fullPage: true });
  console.log("✓ /create");

  await page.goto(`${BASE}/create?mode=try-on`, { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  console.log("/create?mode=try-on URL:", page.url());
  await page.screenshot({ path: `${OUT}\\imaginova-create-tryon.png`, fullPage: true });
  console.log("✓ /create?mode=try-on");

  await page.goto(`${BASE}/create/campaign`, { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  console.log("/create/campaign URL:", page.url());
  await page.screenshot({ path: `${OUT}\\imaginova-create-campaign.png`, fullPage: true });
  console.log("✓ /create/campaign");

  await browser.close();
  console.log("Done");
})();

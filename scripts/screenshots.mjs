import { chromium } from "playwright";

const PAGES = [
  { path: "/", name: "homepage" },
  { path: "/create", name: "create-general" },
  { path: "/create?mode=try-on", name: "create-try-on" },
  { path: "/create?mode=style-transfer", name: "create-style-transfer" },
  { path: "/create?mode=gender-swap", name: "create-gender-swap" },
  { path: "/create?mode=age-transform", name: "create-age-transform" },
];

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Users\\xgame\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe",
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Login directly
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.fill('input[name="email"]', "screenshot@test.com");
await page.fill('input[name="password"]', "test123456");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard", { timeout: 15000 });
console.log("✓ login successful, on dashboard");
await page.waitForTimeout(1000);

async function takeScreenshots(suffix, enableDark) {
  if (enableDark) {
    await page.addStyleTag({ content: "html { color-scheme: dark; }" });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
  } else {
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
  }

  for (const { path, name } of PAGES) {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    if (enableDark) {
      await page.evaluate(() => document.documentElement.classList.add("dark"));
    }
    await page.screenshot({ path: `screenshots/${name}${suffix}.png`, fullPage: true });
    console.log(`✓ ${name}${suffix}`);
  }
}

// Light mode screenshots (overwrite existing)
await takeScreenshots("", false);
// Dark mode screenshots
await takeScreenshots("-dark", true);

await browser.close();
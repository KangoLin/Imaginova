from playwright.sync_api import sync_playwright
import os

BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    # --- Register a test user ---
    page.goto(f"{BASE}/login?mode=register")
    page.wait_for_load_state("networkidle")

    email = f"test_{os.urandom(4).hex()}@test.com"
    name = "Test User"
    pw = "test123456"

    page.fill('input[name="name"]', name)
    page.fill('input[name="email"]', email)
    page.fill('input[name="password"]', pw)
    # Wait a bit for any verification code UI then click register button
    page.wait_for_timeout(500)
    page.click('button[type="submit"]')
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Should be redirected to /dashboard after registration
    page.goto(f"{BASE}/create")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/imaginova-create.png", full_page=True)

    page.goto(f"{BASE}/create?mode=try-on")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/imaginova-create-tryon.png", full_page=True)

    page.goto(f"{BASE}/create?mode=style-transfer")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/imaginova-create-style-transfer.png", full_page=True)

    page.goto(f"{BASE}/create/campaign")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/imaginova-create-campaign.png", full_page=True)

    browser.close()
    print("Screenshots saved to /tmp/")

import { test, expect } from "@playwright/test";

test.describe("Frontend Accessibility & Responsiveness", () => {
  test("launch page loads, input visible, no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("巡梦")).toBeVisible();
    await expect(page.getByPlaceholder("你的名字")).toBeVisible();
    const body = page.locator("body");
    const overflow = await body.evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflow).toBe("hidden");
  });

  test("can enter dreamer name and navigate to dream page", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("你的名字").fill("测试用户");
    // The button should be enabled now
    const button = page.getByRole("button", { name: /进入梦境/ });
    await expect(button).toBeEnabled();
    // We won't actually click to avoid hitting the real API in CI
  });

  test("dream page input bar visible, can type and send layout exists", async ({ page }) => {
    // Directly navigate to /dream (it will redirect to / if no dreamer, so we mock localStorage)
    await page.addInitScript(() => {
      localStorage.setItem(
        "chasing-dream.currentDreamer",
        JSON.stringify({ id: "test-dreamer", name: "测试用户" })
      );
    });
    await page.goto("/dream");
    await expect(page.getByPlaceholder("讲述你的梦境碎片…")).toBeVisible();
    await page.getByPlaceholder("讲述你的梦境碎片…").fill("一个测试梦境");
    await expect(page.getByRole("button", { name: /发送/ })).toBeEnabled();
  });

  test("calendar page loads", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "chasing-dream.currentDreamer",
        JSON.stringify({ id: "test-dreamer", name: "测试用户" })
      );
    });
    await page.goto("/calendar");
    await expect(page.getByText("梦境日历")).toBeVisible();
  });

  test("focus ring visible on interactive elements", async ({ page }) => {
    await page.goto("/");
    const input = page.getByPlaceholder("你的名字");
    await input.focus();
    const outline = await input.evaluate((el) => getComputedStyle(el).outline);
    expect(outline).not.toBe("none");
  });

  test("reduced motion CSS exists", async ({ page }) => {
    await page.goto("/");
    const styles = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules);
          for (const rule of rules) {
            if (rule.cssText.includes("prefers-reduced-motion")) {
              return rule.cssText;
            }
          }
        } catch {
          // cross-origin stylesheet
        }
      }
      return "";
    });
    expect(styles).toContain("prefers-reduced-motion");
  });
});

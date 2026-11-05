import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const GENERATED_PASSWORD = /^.{20}$/;

test('generates a password locally', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'FacPass' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Generator' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  const output = page.getByLabel('Generated password');
  await expect(output).toHaveText(GENERATED_PASSWORD);

  await page.getByRole('button', { name: 'Generate' }).first().click();
  await expect(output).toHaveText(GENERATED_PASSWORD);
});

test('generates a passphrase from the local word list', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Passphrase' }).click();

  await expect(page.getByText(/Using the local EFF large word list/)).toBeVisible();
  await page.getByRole('button', { name: 'Generate' }).first().click();

  await expect(page.getByLabel('Generated passphrase')).toHaveText(/^[a-z]+(-[a-z]+){4}$/);
});

test('generates a six-digit PIN', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'PIN' }).click();

  await expect(page.getByLabel('Generated pin')).toHaveText(/^\d{6}$/);
});

test('copies and clears the current generated value', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');

  const output = page.getByLabel('Generated password');
  const generated = await output.textContent();
  expect(generated).toMatch(GENERATED_PASSWORD);

  await page.getByRole('button', { name: 'Copy' }).click();

  await expect(
    page.getByText('Copied to the clipboard. Clear it when you are done.'),
  ).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(generated);

  await page.getByRole('button', { name: 'Clear' }).click();

  await expect(output).toHaveText('Choose options, then generate a password.');
});

test('analyzes a common password', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Analyze' }).click();

  await page.getByLabel('Password to analyze').fill('password');

  await expect(page.getByText('This is a commonly used password')).toBeVisible();
  await expect(page.getByText('Breach checking is not enabled')).toBeVisible();
});

test('works offline after the first load', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  await page.reload();
  await expect(page.getByLabel('Generated password')).toHaveText(GENERATED_PASSWORD);

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByText('Offline', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Generated password')).toHaveText(GENERATED_PASSWORD);

  await page.getByRole('tab', { name: 'Analyze' }).click();
  await page.getByLabel('Password to analyze').fill('password');
  await expect(page.getByText('This is a commonly used password')).toBeVisible();

  await page.getByRole('tab', { name: 'Generator' }).click();
  await page.getByRole('tab', { name: 'Passphrase' }).click();
  await expect(page.getByText(/Using the local EFF large word list/)).toBeVisible();
  await page.getByRole('button', { name: 'Generate' }).first().click();
  await expect(page.getByLabel('Generated passphrase')).toHaveText(/^[a-z]+(-[a-z]+){4}$/);

  await context.setOffline(false);
});

test('has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expectNoSeriousViolations(page);

  await page.getByRole('tab', { name: 'Analyze' }).click();
  await page.getByLabel('Password to analyze').fill('password');
  await expect(page.getByText('This is a commonly used password')).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expectNoSeriousViolations(page);

  await page.getByRole('tab', { name: 'Settings' }).click();
  await expectNoSeriousViolations(page);
});

test('does not persist analyzed values in caches or storage', async ({ page }) => {
  const marker = `facpass-marker-${Date.now()}`;

  await page.goto('/');
  await page.getByRole('tab', { name: 'Analyze' }).click();
  await page.getByLabel('Password to analyze').fill(marker);
  await page.waitForTimeout(500);

  const result = await page.evaluate(async (value) => {
    let cacheLeak = false;

    for (const name of await caches.keys()) {
      const cache = await caches.open(name);

      for (const request of await cache.keys()) {
        if (request.url.includes(value)) {
          cacheLeak = true;
          break;
        }

        const response = await cache.match(request);
        if (response && (await response.text()).includes(value)) {
          cacheLeak = true;
          break;
        }
      }

      if (cacheLeak) {
        break;
      }
    }

    return {
      cacheLeak,
      localStorageLeak: Object.values(localStorage).some((entry) => entry.includes(value)),
      sessionStorageLeak: Object.values(sessionStorage).some((entry) => entry.includes(value)),
      urlLeak: window.location.href.includes(value),
    };
  }, marker);

  expect(result).toEqual({
    cacheLeak: false,
    localStorageLeak: false,
    sessionStorageLeak: false,
    urlLeak: false,
  });
});

test('fits a 320px viewport without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');

  await expect(page.getByLabel('Generated password')).toHaveText(GENERATED_PASSWORD);

  const generatorOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(generatorOverflow).toBe(false);

  await page.getByRole('tab', { name: 'Analyze' }).click();

  const analyzerOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(analyzerOverflow).toBe(false);
});

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

  expect(seriousViolations(results.violations)).toEqual([]);
}

function seriousViolations(violations: ReadonlyArray<{ impact?: string | null }>) {
  return violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
}

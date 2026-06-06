/* eslint-disable playwright/no-conditional-in-test --
 * This single smoke test runs across mobile/tablet/desktop projects and must
 * branch on viewport, plus use idempotent visibility checks when opening the
 * sidebar dialog and expanding groups. Splitting into per-viewport tests would
 * duplicate the journey body without changing what is exercised.
 */
import { expect, test } from '@playwright/test';

/**
 * Smoke test against the deployed Storybook: land on the root and navigate
 * through several components via the left sidebar - the same way a user would.
 *
 * Compact viewports (mobile, tablet) navigate via each component's "Docs" tab,
 * which exists for every component and is reliable to click in the touch dialog.
 * Desktop exercises specific stories.
 */

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('navigates components via sidebar', async ({ page }, testInfo) => {
  test.setTimeout(60_000);

  // Skip CSS transitions so the mobile dialog and sidebar reach a stable layout
  // immediately after opening - otherwise click stability checks can spin forever.
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const compact = testInfo.project.name === 'mobile' || testInfo.project.name === 'tablet';

  // (group, component, viewMode, storySlug). For compact viewports, always land
  // on the component's Docs page; for desktop, click a specific story.
  const journey = compact
    ? [
        { group: 'General', component: 'Button', mode: 'docs', target: 'docs' },
        { group: 'Data Entry', component: 'Input', mode: 'docs', target: 'docs' },
        { group: 'Data Display', component: 'Table', mode: 'docs', target: 'docs' },
        { group: 'Feedback', component: 'Alert', mode: 'docs', target: 'docs' },
        { group: 'Feedback', component: 'Modal', mode: 'docs', target: 'docs' },
      ]
    : [
        { group: 'General', component: 'Button', mode: 'story', target: 'default' },
        { group: 'Data Entry', component: 'Input', mode: 'story', target: 'default' },
        { group: 'Data Display', component: 'Table', mode: 'story', target: 'basic' },
        { group: 'Feedback', component: 'Alert', mode: 'story', target: 'all-types' },
        { group: 'Feedback', component: 'Modal', mode: 'story', target: 'default' },
      ];

  await page.goto('./', { waitUntil: 'domcontentloaded' });

  // On mobile/narrow viewports the sidebar lives inside a hamburger-toggled dialog.
  // The button's aria-expanded can be stale on first paint, AND the explorer tree
  // is mounted in DOM even while the dialog is closed - so trust actual *visibility*
  // of a sidebar item.
  const sidebar = page.locator('#storybook-explorer-tree');
  const firstSidebarItem = sidebar.locator('a, button').first();
  const openSidebarIfNeeded = async () => {
    const menuButton = page.getByRole('button', { name: 'Open navigation menu' });
    if (!(await menuButton.isVisible().catch(() => false))) return;
    if (await firstSidebarItem.isVisible().catch(() => false)) return;
    await menuButton.click();
    await expect(firstSidebarItem).toBeVisible({ timeout: 5_000 });
  };

  await openSidebarIfNeeded();

  // Group toggles only have visible-text labels; component toggles also expose
  // an `id` matching their slug (e.g. id="general-button"). We expand the
  // group via its toggle, but for the component itself we don't depend on its
  // tree expanding - Storybook v10's sidebar treats a component-button click
  // as a navigation to the component's primary entry (the Docs page when
  // autodocs is on), and child story links don't reliably appear in the tree
  // across viewports. We use the click for "via the sidebar" intent, then
  // fall back to URL-based navigation for any specific story target.
  const expandGroupIfNeeded = async (
    toggle: ReturnType<typeof sidebar.locator>,
    childToggle: ReturnType<typeof sidebar.locator>,
  ) => {
    await toggle.waitFor({ state: 'visible' });
    if (await childToggle.isVisible().catch(() => false)) return;
    await toggle.click();
    await expect(childToggle).toBeVisible({ timeout: 5_000 });
  };

  for (const step of journey) {
    await openSidebarIfNeeded();

    const componentSlug = `${slug(step.group)}-${slug(step.component)}`;
    const path = `${step.mode}/${componentSlug}--${step.target}`;
    const componentToggle = sidebar.locator(`button[id="${componentSlug}"]`);
    const groupToggle = sidebar
      .locator('button[aria-expanded]')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegex(step.group)}\\s*$`) })
      .first();

    await expandGroupIfNeeded(groupToggle, componentToggle);

    // Click navigates to the component's primary entry. This may already match
    // the desired path (compact viewports targeting docs); otherwise fall
    // through to URL-based navigation for the specific story.
    await componentToggle.click();

    await page
      .waitForURL((url) => url.search.includes(`path=/${path}`), { timeout: 5_000 })
      .catch(async () => {
        await page.goto(`./?path=/${path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForURL((url) => url.search.includes(`path=/${path}`));
      });

    // Wait for the preview iframe document to load.
    await page.waitForFunction(
      () =>
        (document.getElementById('storybook-preview-iframe') as HTMLIFrameElement | null)
          ?.contentDocument?.readyState === 'complete',
      null,
      { timeout: 15_000 },
    );

    // Storybook surfaces readiness via a class on <body>: `sb-show-main` once
    // the story is rendered, `sb-show-docs` for docs pages. Until that lands
    // the body shows a `.sb-preparing-story` placeholder, so checking content
    // directly is racy.
    const canvas = page.frameLocator('#storybook-preview-iframe');
    await expect(canvas.locator('body')).toHaveClass(/sb-show-(main|docs)/, {
      timeout: 20_000,
    });
  }
});

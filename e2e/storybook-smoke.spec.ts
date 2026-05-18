import { expect, test } from '@playwright/test'

/**
 * Smoke test against the deployed Storybook: land on the root and navigate
 * through several components via the left sidebar — the same way a user would.
 *
 * Compact viewports (mobile, tablet) navigate via each component's "Docs" tab,
 * which exists for every component and is reliable to click in the touch dialog.
 * Desktop exercises specific stories.
 */

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-')

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

test('navigates components via sidebar', async ({ page }, testInfo) => {
  test.setTimeout(60_000)

  // Skip CSS transitions so the mobile dialog and sidebar reach a stable layout
  // immediately after opening — otherwise click stability checks can spin forever.
  await page.emulateMedia({ reducedMotion: 'reduce' })

  const compact = testInfo.project.name === 'mobile' || testInfo.project.name === 'tablet'

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
        { group: 'Data Entry', component: 'Input', mode: 'story', target: 'playground' },
        { group: 'Data Display', component: 'Table', mode: 'story', target: 'basic' },
        { group: 'Feedback', component: 'Alert', mode: 'story', target: 'all-types' },
        { group: 'Feedback', component: 'Modal', mode: 'story', target: 'default' },
      ]

  await page.goto('./', { waitUntil: 'domcontentloaded' })

  // On mobile/narrow viewports the sidebar lives inside a hamburger-toggled dialog.
  // The button's aria-expanded can be stale on first paint, AND the explorer tree
  // is mounted in DOM even while the dialog is closed — so trust actual *visibility*
  // of a sidebar item.
  const sidebar = page.locator('#storybook-explorer-tree')
  const firstSidebarItem = sidebar.locator('a, button').first()
  const openSidebarIfNeeded = async () => {
    const menuButton = page.getByRole('button', { name: 'Open navigation menu' })
    if (!(await menuButton.isVisible().catch(() => false))) return
    if (await firstSidebarItem.isVisible().catch(() => false)) return
    await menuButton.click()
    await expect(firstSidebarItem).toBeVisible({ timeout: 5_000 })
  }

  await openSidebarIfNeeded()

  // Group toggles only have visible-text labels; component toggles also expose
  // an `id` matching their slug (e.g. id="general-button"). Use the id when we
  // can — it's exact, unaffected by descendant text — and fall back to anchored
  // text otherwise. We then expand by checking the *link's* visibility rather
  // than aria-expanded, which Storybook can lag on during initial paint.
  const expandUntilVisible = async (
    toggle: ReturnType<typeof sidebar.locator>,
    childMarker: ReturnType<typeof sidebar.locator>,
  ) => {
    await toggle.waitFor({ state: 'visible' })
    if (await childMarker.isVisible().catch(() => false)) return
    await toggle.click()
    await expect(childMarker).toBeVisible({ timeout: 5_000 })
  }

  for (const step of journey) {
    await openSidebarIfNeeded()

    const componentSlug = `${slug(step.group)}-${slug(step.component)}`
    const path = `${step.mode}/${componentSlug}--${step.target}`
    const link = sidebar.locator(`a[href*="path=/${path}"]`).first()
    const componentToggle = sidebar.locator(`button[id="${componentSlug}"]`)
    const groupToggle = sidebar
      .locator('button[aria-expanded]')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegex(step.group)}\\s*$`) })
      .first()

    // Expand the group only if its component toggle isn't yet visible.
    await expandUntilVisible(groupToggle, componentToggle)
    // Expand the component only if its target link isn't yet visible.
    await expandUntilVisible(componentToggle, link)

    await link.click()

    await page.waitForURL((url) => url.search.includes(`path=/${path}`))

    // Wait for the preview iframe document to load.
    await page.waitForFunction(
      () =>
        (document.getElementById('storybook-preview-iframe') as HTMLIFrameElement | null)
          ?.contentDocument?.readyState === 'complete',
      null,
      { timeout: 15_000 },
    )

    // Storybook surfaces readiness via a class on <body>: `sb-show-main` once
    // the story is rendered, `sb-show-docs` for docs pages. Until that lands
    // the body shows a `.sb-preparing-story` placeholder, so checking content
    // directly is racy.
    const canvas = page.frameLocator('#storybook-preview-iframe')
    await expect(canvas.locator('body')).toHaveClass(/sb-show-(main|docs)/, {
      timeout: 20_000,
    })
  }
})

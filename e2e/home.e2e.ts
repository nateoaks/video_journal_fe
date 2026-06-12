import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
})

test('home page renders the heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()
})

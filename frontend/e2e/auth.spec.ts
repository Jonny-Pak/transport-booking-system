import { test, expect } from '@playwright/test'

test('register, login, reload, role guard and logout against the real API', async ({
  page,
  context,
  isMobile,
}) => {
  const email = `browser-${crypto.randomUUID()}@example.com`
  const password = 'BrowserTest123!'
  await page.goto('/register')
  await page.getByLabel('Họ và tên', { exact: true }).fill('Khách kiểm thử')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page
    .getByLabel('Mật khẩu (ít nhất 8 ký tự)', { exact: true })
    .fill(password)
  await page.getByLabel('Nhập lại mật khẩu', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Đăng ký', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByText('Đăng ký thành công. Vui lòng đăng nhập.'),
  ).toBeVisible()
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Mật khẩu', { exact: true }).fill('WrongPassword123!')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(
    page.getByText(
      'Email hoặc mật khẩu không đúng, hoặc tài khoản không khả dụng.',
    ),
  ).toBeVisible()
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL(/\/my-bookings$/)
  await expect(
    page.getByText('Khu vực khách hàng — bản xem trước'),
  ).toBeVisible()
  const cookie = (await context.cookies()).find(
    (item) => item.name === 'JSESSIONID',
  )
  expect(cookie?.httpOnly).toBe(true)
  expect(cookie?.sameSite).toBe('Lax')
  await page.reload()
  await expect(
    page.getByText('Khu vực khách hàng — bản xem trước'),
  ).toBeVisible()
  await page.goto('/admin')
  await expect(
    page.getByText('Bạn không có quyền truy cập trang này.'),
  ).toBeVisible()
  await page.goto('/my-bookings')
  if (isMobile) await page.getByRole('button', { name: 'Mở menu' }).click()
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/my-bookings')
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/register')
  await page.getByLabel('Họ và tên', { exact: true }).fill('Khách kiểm thử')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page
    .getByLabel('Mật khẩu (ít nhất 8 ký tự)', { exact: true })
    .fill(password)
  await page.getByLabel('Nhập lại mật khẩu', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Đăng ký', exact: true }).click()
  await expect(page.getByText('Email đã được sử dụng.')).toBeVisible()
})

test('validates registration and fits the viewport', async ({ page }) => {
  await page.goto('/register')
  await page.getByRole('button', { name: 'Đăng ký', exact: true }).click()
  await expect(page.getByText('Vui lòng nhập họ tên.')).toBeVisible()
  await page.getByLabel('Họ và tên', { exact: true }).fill('Người dùng')
  await page.getByLabel('Email', { exact: true }).fill('person@example.com')
  await page
    .getByLabel('Mật khẩu (ít nhất 8 ký tự)', { exact: true })
    .fill('Password123!')
  await page
    .getByLabel('Nhập lại mật khẩu', { exact: true })
    .fill('Different123!')
  await page.getByRole('button', { name: 'Đăng ký', exact: true }).click()
  await expect(page.getByText('Mật khẩu xác nhận không khớp.')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})

test('protected page shows a recoverable API error', async ({ page }) => {
  await page.route('**/auth/me', (route) => route.abort())
  await page.goto('/my-bookings')
  await expect(
    page.getByText('Không thể kiểm tra phiên đăng nhập'),
  ).toBeVisible()
  await page.unroute('**/auth/me')
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
})

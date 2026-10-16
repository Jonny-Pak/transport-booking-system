import { z } from 'zod'

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email không hợp lệ.')
  .max(254)
const password = z
  .string()
  .min(8, 'Mật khẩu cần ít nhất 8 ký tự.')
  .max(72, 'Mật khẩu quá dài.')
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    'Mật khẩu không được vượt quá 72 byte UTF-8.',
  )

export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu.')
    .max(72, 'Mật khẩu quá dài.'),
})

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên.').max(150),
    email,
    phone: z
      .string()
      .trim()
      .regex(/^$|^[+0-9() .-]{8,25}$/, 'Số điện thoại không hợp lệ.'),
    password,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>

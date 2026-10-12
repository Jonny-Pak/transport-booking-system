import { z } from 'zod'
export function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
export const searchSchema = z
  .object({
    origin: z.string().min(1, 'Vui lòng chọn điểm đi'),
    destination: z.string().min(1, 'Vui lòng chọn điểm đến'),
    departureDate: z
      .string()
      .min(1, 'Vui lòng chọn ngày đi')
      .refine((value) => value >= localDate(), 'Ngày đi không được ở quá khứ'),
  })
  .refine((value) => value.origin !== value.destination, {
    message: 'Điểm đến phải khác điểm đi',
    path: ['destination'],
  })
export type TripSearchValues = z.infer<typeof searchSchema>

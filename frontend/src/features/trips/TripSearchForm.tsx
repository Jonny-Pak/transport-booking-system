import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from 'antd'
import { localDate, searchSchema } from './searchSchema'
import type { TripSearchValues } from './searchSchema'
const cities = ['TP. Hồ Chí Minh', 'Đà Lạt', 'Nha Trang', 'Hà Nội', 'Sa Pa']
export function TripSearchForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripSearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { origin: '', destination: '', departureDate: localDate() },
  })
  function submit(values: TripSearchValues) {
    navigate(`/trips?${new URLSearchParams(values).toString()}`)
  }
  return (
    <form className="search-form" onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label htmlFor="origin">Điểm đi</label>
        <select
          id="origin"
          {...register('origin')}
          aria-invalid={!!errors.origin}
          aria-describedby="origin-error"
        >
          <option value="">Bạn xuất phát từ đâu?</option>
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
        <span id="origin-error" className="field-error">
          {errors.origin?.message}
        </span>
      </div>
      <div>
        <label htmlFor="destination">Điểm đến</label>
        <select
          id="destination"
          {...register('destination')}
          aria-invalid={!!errors.destination}
          aria-describedby="destination-error"
        >
          <option value="">Bạn muốn đến đâu?</option>
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
        <span id="destination-error" className="field-error">
          {errors.destination?.message}
        </span>
      </div>
      <div>
        <label htmlFor="departureDate">Ngày khởi hành</label>
        <input
          id="departureDate"
          type="date"
          min={localDate()}
          {...register('departureDate')}
          aria-invalid={!!errors.departureDate}
          aria-describedby="date-error"
        />
        <span id="date-error" className="field-error">
          {errors.departureDate?.message}
        </span>
      </div>
      <Button
        type="primary"
        htmlType="submit"
        size="large"
        icon={<Search size={18} />}
      >
        Tìm chuyến xe
      </Button>
    </form>
  )
}

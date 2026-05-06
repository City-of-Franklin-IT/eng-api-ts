import moment from 'moment'

export default function handleDateOnly(raw: Date | string | null, format: string = 'YYYY-MM-DD'): string | null {
  if (!raw) return raw

  const dateStr = raw instanceof Date ? 
    raw.toISOString().split('T')[0] : 
    raw
  
  const date = moment(dateStr, 'YYYY-MM-DD')
  date.add(1, 'day')

  return date.format(format)
}
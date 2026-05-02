import moment from 'moment'

export default function handleDateOnly(raw: Date | string | null, format: string = 'YYYY-MM-DD'): string | null {
  if(!raw) return raw

  const date = typeof raw === 'string' ? 
    new Date(raw) : 
    new Date(raw)

  date.setDate(date.getDate() + 1)
  
  return moment(date).format(format)
}

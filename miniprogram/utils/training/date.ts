/** 日期相关纯函数（无副作用，便于测试）。 */

export const pad = (value: number) => `${value}`.padStart(2, '0')

export const toDateText = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const parseDateText = (dateText: string) => {
  const [year, month, day] = dateText.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatMonthTitle = (date: Date) =>
  `${date.getFullYear()}年${date.getMonth() + 1}月`

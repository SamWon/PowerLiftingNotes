/** 日期相关纯函数（无副作用，便于测试）。 */

import { ISO_DATE_REGEX } from '../constants'

export const pad = (value: number) => `${value}`.padStart(2, '0')

export const toDateText = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/**
 * 把 `YYYY-MM-DD` 解析成 Date。**不做合法性校验**（保持旧行为）：
 * 调用方应保证传入的是 `toDateText` 的产物。如需校验请用 {@link tryParseDateText}。
 */
export const parseDateText = (dateText: string) => {
  const [year, month, day] = dateText.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * 严格解析：
 * - 格式必须是 `YYYY-MM-DD`
 * - 解析回来后必须与原字符串一致（防止 2024-02-30 这种隐式溢出）
 *
 * 不合法时返回 null。
 */
export const tryParseDateText = (text: string): Date | null => {
  if (typeof text !== 'string' || !ISO_DATE_REGEX.test(text)) {
    return null
  }
  const [year, month, day] = text.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export const formatMonthTitle = (date: Date) =>
  `${date.getFullYear()}年${date.getMonth() + 1}月`

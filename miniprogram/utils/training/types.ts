/** 训练相关数据结构。 */

export interface TrainingSet {
  /** 次数 */
  reps: number
  /** RPE 1-10 */
  rpe: number
  /**
   * 重量（kg），允许 0（自重 / 空杆）。
   * 历史数据可能缺省，加载时会被规范化为 0。
   */
  weight: number
}

export interface TrainingExercise {
  name: string
  sets: TrainingSet[]
}

export interface TrainingRecord {
  id: string
  date: string
  createdAt: number
  exercises: TrainingExercise[]
  /** 当天的副标题/备注，非必填。 */
  note?: string
}

/**
 * 表单中尚未提交的草稿组（reps / rpe / weight 仍是字符串，便于受控输入）。
 * inputMode 决定 weight 字段如何获得：
 * - 'weight'  ：直接输入重量（kg）
 * - 'percent' ：输入 1RM 百分比，按选中动作的 1RM 自动换算成 kg
 */
export interface DraftSet {
  reps: string
  rpe: string
  weight: string
  percent: string
  inputMode: 'weight' | 'percent'
}

/** 各动作的 1RM 表（kg），按动作名称索引。 */
export interface OneRepMaxMap {
  [exerciseName: string]: number
}

export interface CalendarDay {
  key: string
  label: string
  date: string
  isCurrentMonth: boolean
  hasWorkout: boolean
  isToday: boolean
  setCount: number
  isSelected: boolean
}

/** 训练相关数据结构。 */

export interface TrainingSet {
  reps: number
  rpe: number
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
}

/** 表单中尚未提交的草稿组（reps / rpe 仍是字符串，便于受控输入）。 */
export interface DraftSet {
  reps: string
  rpe: string
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

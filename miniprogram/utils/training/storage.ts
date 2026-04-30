import { DEFAULT_EXERCISE_NAMES } from '../../config/exercises'
import { isTrainingRecord, sortRecords } from './records'
import { TrainingRecord } from './types'

/** 本地存储 key 常量。集中维护，方便后续做版本迁移。 */
export const STORAGE_KEY = 'powerlifting_training_records'
export const EXERCISE_KEY = 'powerlifting_exercises'

/** 训练记录读写 */
export const loadTrainingRecords = (): TrainingRecord[] => {
  const storedRecords = wx.getStorageSync(STORAGE_KEY) as TrainingRecord[] | ''
  return Array.isArray(storedRecords)
    ? sortRecords(storedRecords.filter(isTrainingRecord))
    : []
}

export const saveTrainingRecords = (records: TrainingRecord[]) => {
  wx.setStorageSync(STORAGE_KEY, sortRecords(records))
}

/** 动作选项读写（仅保存名称数组，富信息走 config/exercises.ts）。 */
export const loadExerciseOptions = (): string[] => {
  const storedExercises = wx.getStorageSync(EXERCISE_KEY) as string[] | ''
  return Array.isArray(storedExercises) && storedExercises.length > 0
    ? storedExercises
    : [...DEFAULT_EXERCISE_NAMES]
}

export const saveExerciseOptions = (exercises: string[]) => {
  wx.setStorageSync(EXERCISE_KEY, exercises)
}

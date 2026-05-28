import { DEFAULT_EXERCISE_NAMES } from '../../config/exercises'
import { isTestDataMode } from './dev-switch'
import { isTrainingRecord, normalizeRecord, sortRecords } from './records'
import { TEST_EXERCISE_OPTIONS, TEST_ONE_REP_MAX, TEST_TRAINING_RECORDS } from './test-data'
import { OneRepMaxMap, TrainingRecord } from './types'

/** 本地存储 key 常量。集中维护，方便后续做版本迁移。 */
export const STORAGE_KEY = 'powerlifting_training_records'
export const EXERCISE_KEY = 'powerlifting_exercises'
export const ONE_REP_MAX_KEY = 'powerlifting_one_rep_max'

/** 训练记录读写 */
export const loadTrainingRecords = (): TrainingRecord[] => {
  if (isTestDataMode()) {
    return sortRecords([...TEST_TRAINING_RECORDS])
  }
  const storedRecords = wx.getStorageSync(STORAGE_KEY) as TrainingRecord[] | ''
  if (!Array.isArray(storedRecords)) {
    return []
  }
  // 先规范化（补齐 weight=0），再做合法性校验。
  const normalized = storedRecords
    .map(record => (record && typeof record === 'object' ? normalizeRecord(record) : record))
    .filter(isTrainingRecord)
  return sortRecords(normalized)
}

export const saveTrainingRecords = (records: TrainingRecord[]) => {
  if (isTestDataMode()) return // 测试模式下不写入真实存储
  wx.setStorageSync(STORAGE_KEY, sortRecords(records))
}

/** 动作选项读写（仅保存名称数组，富信息走 config/exercises.ts）。 */
export const loadExerciseOptions = (): string[] => {
  if (isTestDataMode()) {
    return [...TEST_EXERCISE_OPTIONS]
  }
  const storedExercises = wx.getStorageSync(EXERCISE_KEY) as string[] | ''
  return Array.isArray(storedExercises) && storedExercises.length > 0
    ? storedExercises
    : [...DEFAULT_EXERCISE_NAMES]
}

export const saveExerciseOptions = (exercises: string[]) => {
  if (isTestDataMode()) return
  wx.setStorageSync(EXERCISE_KEY, exercises)
}

/** 1RM 读写：每个动作可选填一个 1RM（kg），用于按百分比换算训练重量。 */
export const loadOneRepMaxMap = (): OneRepMaxMap => {
  if (isTestDataMode()) {
    return { ...TEST_ONE_REP_MAX }
  }
  const stored = wx.getStorageSync(ONE_REP_MAX_KEY) as OneRepMaxMap | ''
  if (!stored || typeof stored !== 'object') {
    return {}
  }
  const result: OneRepMaxMap = {}
  Object.keys(stored).forEach(key => {
    const value = Number((stored as OneRepMaxMap)[key])
    if (Number.isFinite(value) && value > 0) {
      result[key] = value
    }
  })
  return result
}

export const saveOneRepMaxMap = (map: OneRepMaxMap) => {
  if (isTestDataMode()) return
  wx.setStorageSync(ONE_REP_MAX_KEY, map)
}

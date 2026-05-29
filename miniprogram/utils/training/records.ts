import { DraftSet, TrainingExercise, TrainingRecord, TrainingSet } from './types'

export const createDefaultSet = (): DraftSet => ({
  reps: '5',
  rpe: '7',
  weight: '',
  percent: '',
  inputMode: 'weight',
})

export const sortRecords = (records: TrainingRecord[]) => {
  // 克隆后再排序，避免修改调用方传入的数组（隐藏副作用易出 bug）。
  return [...records].sort(
    (first, second) =>
      second.date.localeCompare(first.date) || second.createdAt - first.createdAt,
  )
}

export const countSets = (records: TrainingRecord[]) => {
  return records.reduce((recordSum, record) => {
    return (
      recordSum +
      record.exercises.reduce(
        (exerciseSum, exercise) => exerciseSum + exercise.sets.length,
        0,
      )
    )
  }, 0)
}

/**
 * 规范化历史数据：缺失的 weight 字段补 0，便于向后兼容旧版本导出 / 旧本地存储。
 */
export const normalizeSet = (value: any): TrainingSet => ({
  reps: Number(value ? value.reps : undefined),
  rpe: Number(value ? value.rpe : undefined),
  weight: Number.isFinite(Number(value ? value.weight : undefined)) ? Number(value.weight) : 0,
})

export const normalizeRecord = (record: TrainingRecord): TrainingRecord => ({
  ...record,
  note: typeof record.note === 'string' ? record.note : undefined,
  // 防护 exercises 缺失或不是数组的脑裂场景（旧数据或损坏数据）。
  exercises: Array.isArray(record.exercises)
    ? record.exercises.map(exercise => ({
        ...exercise,
        sets: Array.isArray(exercise && exercise.sets) ? exercise.sets.map(normalizeSet) : [],
      }))
    : [],
})

export const isTrainingSet = (value: unknown): value is TrainingSet => {
  const item = value as TrainingSet
  return (
    Number.isFinite(item ? item.reps : undefined)
    && Number.isFinite(item ? item.rpe : undefined)
    && Number.isFinite(item ? item.weight : undefined)
    && item.reps > 0
    && item.rpe >= 1
    && item.rpe <= 10
    && item.weight >= 0
  )
}

export const isTrainingRecord = (value: unknown): value is TrainingRecord => {
  const item = value as TrainingRecord
  return (
    typeof (item ? item.id : undefined) === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    && Number.isFinite(item.createdAt)
    && Array.isArray(item.exercises)
    && item.exercises.every(
      exercise =>
        typeof (exercise ? exercise.name : undefined) === 'string'
        && exercise.name.length > 0
        && Array.isArray(exercise.sets)
        && exercise.sets.length > 0
        && exercise.sets.every(isTrainingSet),
    )
  )
}

/**
 * 合并同名动作：按 name 顺序保留，sets 拼接。
 * 用于"同一天的训练记录合并"。
 */
export const mergeExercises = (
  base: TrainingExercise[],
  incoming: TrainingExercise[],
): TrainingExercise[] => {
  const result: TrainingExercise[] = base.map(exercise => ({
    name: exercise.name,
    sets: [...exercise.sets],
  }))
  incoming.forEach(exercise => {
    const existing = result.find(item => item.name === exercise.name)
    if (existing) {
      existing.sets.push(...exercise.sets)
    } else {
      result.push({ name: exercise.name, sets: [...exercise.sets] })
    }
  })
  return result
}

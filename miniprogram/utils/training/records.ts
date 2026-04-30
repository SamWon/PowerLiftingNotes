import { DraftSet, TrainingRecord, TrainingSet } from './types'

export const createDefaultSet = (): DraftSet => ({ reps: '5', rpe: '7' })

export const sortRecords = (records: TrainingRecord[]) => {
  return records.sort(
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

export const isTrainingSet = (value: unknown): value is TrainingSet => {
  const item = value as TrainingSet
  return (
    Number.isFinite(item?.reps)
    && Number.isFinite(item?.rpe)
    && item.reps > 0
    && item.rpe >= 1
    && item.rpe <= 10
  )
}

export const isTrainingRecord = (value: unknown): value is TrainingRecord => {
  const item = value as TrainingRecord
  return (
    typeof item?.id === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    && Number.isFinite(item.createdAt)
    && Array.isArray(item.exercises)
    && item.exercises.every(
      exercise =>
        typeof exercise?.name === 'string'
        && exercise.name.length > 0
        && Array.isArray(exercise.sets)
        && exercise.sets.length > 0
        && exercise.sets.every(isTrainingSet),
    )
  )
}

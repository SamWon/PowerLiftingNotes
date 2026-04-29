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
  isSelected: boolean
}

export interface ExportPayload {
  app: string
  version: number
  exportedAt: string
  records: TrainingRecord[]
}

export const STORAGE_KEY = 'powerlifting_training_records'
export const EXERCISE_KEY = 'powerlifting_exercises'
export const DEFAULT_EXERCISES = ['卧推', '深蹲', '硬拉']

export const pad = (value: number) => `${value}`.padStart(2, '0')

export const toDateText = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const parseDateText = (dateText: string) => {
  const [year, month, day] = dateText.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatMonthTitle = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月`

export const createDefaultSet = (): DraftSet => ({ reps: '5', rpe: '7' })

export const sortRecords = (records: TrainingRecord[]) => {
  return records.sort((first, second) => second.date.localeCompare(first.date) || second.createdAt - first.createdAt)
}

export const countSets = (records: TrainingRecord[]) => {
  return records.reduce((recordSum, record) => {
    return recordSum + record.exercises.reduce((exerciseSum, exercise) => exerciseSum + exercise.sets.length, 0)
  }, 0)
}

export const isTrainingSet = (value: unknown): value is TrainingSet => {
  const item = value as TrainingSet
  return Number.isFinite(item?.reps) && Number.isFinite(item?.rpe) && item.reps > 0 && item.rpe >= 1 && item.rpe <= 10
}

export const isTrainingRecord = (value: unknown): value is TrainingRecord => {
  const item = value as TrainingRecord
  return typeof item?.id === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    && Number.isFinite(item.createdAt)
    && Array.isArray(item.exercises)
    && item.exercises.every(exercise => typeof exercise?.name === 'string'
      && exercise.name.length > 0
      && Array.isArray(exercise.sets)
      && exercise.sets.length > 0
      && exercise.sets.every(isTrainingSet))
}

export const loadTrainingRecords = () => {
  const storedRecords = wx.getStorageSync(STORAGE_KEY) as TrainingRecord[] | ''
  return Array.isArray(storedRecords) ? sortRecords(storedRecords.filter(isTrainingRecord)) : []
}

export const saveTrainingRecords = (records: TrainingRecord[]) => {
  wx.setStorageSync(STORAGE_KEY, sortRecords(records))
}

export const loadExerciseOptions = () => {
  const storedExercises = wx.getStorageSync(EXERCISE_KEY) as string[] | ''
  return Array.isArray(storedExercises) && storedExercises.length > 0 ? storedExercises : DEFAULT_EXERCISES
}

export const saveExerciseOptions = (exercises: string[]) => {
  wx.setStorageSync(EXERCISE_KEY, exercises)
}

export const normalizeImportedRecords = (content: string) => {
  const parsed = JSON.parse(content) as ExportPayload | TrainingRecord[]
  const records = Array.isArray(parsed) ? parsed : parsed.records
  if (!Array.isArray(records) || !records.every(isTrainingRecord)) {
    throw new Error('Invalid training records file')
  }
  return records
}
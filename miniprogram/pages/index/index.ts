import {
  CalendarDay,
  OneRepMaxMap,
  TrainingExercise,
  TrainingRecord,
  TrainingSet,
  formatMonthTitle,
  loadOneRepMaxMap,
  loadTrainingRecords,
  parseDateText,
  saveTrainingRecords,
  toDateText,
} from '../../utils/training/index'
import { STORAGE_KEYS } from '../../utils/constants'
import { themeColors } from '../../utils/theme'

type RecordViewMode = 'list' | 'calendar'

interface SetChip {
  /** 主文本：5次 · 100kg · RPE 7（重量为 0 时不显示重量） */
  text: string
  /** 副文本：1RM 百分比；仅在该动作存在 1RM 时显示 */
  percent: string
}

interface ExerciseViewModel {
  name: string
  sets: SetChip[]
}

interface RecordViewModel {
  id: string
  date: string
  createdAt: number
  exerciseCount: number
  exercises: ExerciseViewModel[]
  note: string
}

const EDITING_KEY = STORAGE_KEYS.EDITING_RECORD_ID

const buildSetChip = (set: TrainingSet, oneRepMax: number): SetChip => {
  const parts: string[] = [`${set.reps}次`]
  if (set.weight > 0) {
    parts.push(`${set.weight}kg`)
  }
  parts.push(`RPE ${set.rpe}`)
  const percent = oneRepMax > 0 && set.weight > 0
    ? `${Math.round((set.weight / oneRepMax) * 100)}% 1RM`
    : ''
  return { text: parts.join(' · '), percent }
}

const buildRecordViewModel = (record: TrainingRecord, oneRepMaxMap: OneRepMaxMap): RecordViewModel => ({
  id: record.id,
  date: record.date,
  createdAt: record.createdAt,
  exerciseCount: record.exercises.length,
  exercises: record.exercises.map((exercise: TrainingExercise) => ({
    name: exercise.name,
    sets: exercise.sets.map(set => buildSetChip(set, oneRepMaxMap[exercise.name] || 0)),
  })),
  note: record.note || '',
})

Component({
  data: {
    recordView: 'list' as RecordViewMode,
    records: [] as TrainingRecord[],
    recordViews: [] as RecordViewModel[],
    oneRepMaxMap: {} as OneRepMaxMap,
    calendarDays: [] as CalendarDay[],
    calendarTitle: '',
    selectedCalendarDate: toDateText(new Date()),
    selectedCalendarRecords: [] as TrainingRecord[],
    monthRecords: [] as TrainingRecord[],
    monthSetCount: 0,
  },
  lifetimes: {
    attached() {
      this.loadLocalData()
    },
  },
  pageLifetimes: {
    show() {
      this.loadLocalData()
    },
  },
  methods: {
    loadLocalData() {
      const records = loadTrainingRecords()
      const oneRepMaxMap = loadOneRepMaxMap()
      this.setData({
        records,
        oneRepMaxMap,
        recordViews: records.map(record => buildRecordViewModel(record, oneRepMaxMap)),
      })
      this.refreshCalendar()
    },
    switchRecordView(event: any) {
      const recordView = event.currentTarget.dataset.view as RecordViewMode
      this.setData({ recordView })
      this.refreshCalendar()
    },
    startNewRecord() {
      wx.removeStorageSync(EDITING_KEY)
      wx.switchTab({ url: '/pages/create/create' })
    },
    editRecord(event: any) {
      const id = event.currentTarget.dataset.id as string
      wx.setStorageSync(EDITING_KEY, id)
      wx.switchTab({ url: '/pages/create/create' })
    },
    deleteRecord(event: any) {
      const id = event.currentTarget.dataset.id as string
      wx.showModal({
        title: '删除记录',
        content: '确认删除这条训练记录吗？',
        confirmText: '删除',
        confirmColor: themeColors.danger,
        success: (res) => {
          if (!res.confirm) {
            return
          }
          const records = this.data.records.filter(record => record.id !== id)
          saveTrainingRecords(records)
          const oneRepMaxMap = this.data.oneRepMaxMap
          this.setData({
            records,
            recordViews: records.map(record => buildRecordViewModel(record, oneRepMaxMap)),
          })
          this.refreshCalendar()
        },
      })
    },
    refreshCalendar() {
      const base = parseDateText(this.data.selectedCalendarDate)
      const monthStart = new Date(base.getFullYear(), base.getMonth(), 1)
      const firstWeekday = monthStart.getDay()
      const gridStart = new Date(monthStart)
      gridStart.setDate(monthStart.getDate() - firstWeekday)
      const todayText = toDateText(new Date())
      const setsByDate = new Map<string, number>()
      this.data.records.forEach(record => {
        const sets = record.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)
        setsByDate.set(record.date, (setsByDate.get(record.date) || 0) + sets)
      })
      const calendarDays: CalendarDay[] = []
      for (let index = 0; index < 42; index += 1) {
        const date = new Date(gridStart)
        date.setDate(gridStart.getDate() + index)
        const dateText = toDateText(date)
        const setCount = setsByDate.get(dateText) || 0
        calendarDays.push({
          key: `${dateText}_${index}`,
          label: `${date.getDate()}`,
          date: dateText,
          isCurrentMonth: date.getMonth() === monthStart.getMonth(),
          hasWorkout: setCount > 0,
          isToday: dateText === todayText,
          setCount,
          isSelected: dateText === this.data.selectedCalendarDate,
        })
      }
      const monthRecords = this.data.records.filter(record => {
        const date = parseDateText(record.date)
        return date.getFullYear() === monthStart.getFullYear() && date.getMonth() === monthStart.getMonth()
      })
      this.setData({
        calendarDays,
        calendarTitle: formatMonthTitle(monthStart),
        selectedCalendarRecords: this.data.records.filter(record => record.date === this.data.selectedCalendarDate),
        monthRecords,
        monthSetCount: monthRecords.reduce((sum, record) => sum + record.exercises.reduce((s, e) => s + e.sets.length, 0), 0),
      })
    },
    changeCalendarMonth(event: any) {
      const offset = Number(event.currentTarget.dataset.offset)
      const date = parseDateText(this.data.selectedCalendarDate)
      date.setMonth(date.getMonth() + offset)
      date.setDate(1)
      this.setData({ selectedCalendarDate: toDateText(date) })
      this.refreshCalendar()
    },
    selectCalendarDate(event: any) {
      const selectedCalendarDate = event.currentTarget.dataset.date as string
      this.setData({ selectedCalendarDate })
      this.refreshCalendar()
    },
  },
})

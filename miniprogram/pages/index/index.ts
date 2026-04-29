import {
  CalendarDay,
  TrainingRecord,
  countSets,
  formatMonthTitle,
  loadTrainingRecords,
  parseDateText,
  saveTrainingRecords,
  toDateText,
} from '../../utils/training'

type RecordView = 'list' | 'calendar'

Component({
  data: {
    recordView: 'list' as RecordView,
    records: [] as TrainingRecord[],
    calendarDays: [] as CalendarDay[],
    calendarTitle: '',
    selectedCalendarDate: toDateText(new Date()),
    selectedCalendarRecords: [] as TrainingRecord[],
    totalWorkouts: 0,
    totalSets: 0,
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
      this.setData({
        records,
        totalWorkouts: records.length,
        totalSets: countSets(records),
      })
      this.refreshCalendar()
    },
    switchRecordView(event: any) {
      const recordView = event.currentTarget.dataset.view as RecordView
      this.setData({ recordView })
      this.refreshCalendar()
    },
    startNewRecord() {
      wx.switchTab({ url: '/pages/create/create' })
    },
    deleteRecord(event: any) {
      const id = event.currentTarget.dataset.id as string
      wx.showModal({
        title: '删除记录',
        content: '确认删除这条训练记录吗？',
        confirmText: '删除',
        confirmColor: '#ff6b81',
        success: (res) => {
          if (!res.confirm) {
            return
          }
          const records = this.data.records.filter(record => record.id !== id)
          saveTrainingRecords(records)
          this.setData({ records, totalWorkouts: records.length, totalSets: countSets(records) })
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
      const activeDates = new Set(this.data.records.map(record => record.date))
      const calendarDays: CalendarDay[] = []
      for (let index = 0; index < 42; index += 1) {
        const date = new Date(gridStart)
        date.setDate(gridStart.getDate() + index)
        const dateText = toDateText(date)
        calendarDays.push({
          key: `${dateText}_${index}`,
          label: `${date.getDate()}`,
          date: dateText,
          isCurrentMonth: date.getMonth() === monthStart.getMonth(),
          hasWorkout: activeDates.has(dateText),
          isSelected: dateText === this.data.selectedCalendarDate,
        })
      }
      this.setData({
        calendarDays,
        calendarTitle: formatMonthTitle(monthStart),
        selectedCalendarRecords: this.data.records.filter(record => record.date === this.data.selectedCalendarDate),
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
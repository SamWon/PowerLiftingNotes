import {
  E1rmPoint,
  EXERCISE_CATALOG,
  ExerciseCard,
  MUSCLE_GROUPS,
  MuscleGroup,
  MuscleGroupDefinition,
  TrainingRecord,
  WeeklyVolumePoint,
  collectE1rmPoints,
  computeWeeklyVolume,
  getExerciseDefinition,
  getExerciseGroupImage,
  loadTrainingRecords,
  toExerciseCard,
  tryParseDateText,
} from '../../utils/training/index'
import { SBD_EXERCISE_NAMES } from '../../utils/constants'
import { themeColors } from '../../utils/theme'

/** 顶部主 tab：Top 组 / e1RM / 周容量。 */
type StatsTab = 'top' | 'e1rm' | 'volume'

/** 时间范围（Top 组 / e1RM 共用）。 */
type RangeKey = 'half' | 'year' | 'twoYears'

interface RangeOption {
  id: RangeKey
  label: string
  months: number
}

const RANGE_OPTIONS: RangeOption[] = [
  { id: 'twoYears', label: '2 年', months: 24 },
  { id: 'year', label: '1 年', months: 12 },
  { id: 'half', label: '半年', months: 6 },
]

/** 周容量窗口长度。 */
type WeeksKey = 'w4' | 'w8' | 'w12'

interface WeeksOption {
  id: WeeksKey
  label: string
  weeks: number
}

const WEEKS_OPTIONS: WeeksOption[] = [
  { id: 'w4', label: '4 周', weeks: 4 },
  { id: 'w8', label: '8 周', weeks: 8 },
  { id: 'w12', label: '12 周', weeks: 12 },
]

interface TabOption {
  id: StatsTab
  label: string
}

const TAB_OPTIONS: TabOption[] = [
  { id: 'top', label: 'Top 组' },
  { id: 'e1rm', label: 'e1RM' },
  { id: 'volume', label: '周容量' },
]

interface ChartPointView {
  date: string
  shortDate: string
  weight: number
}

interface E1rmPointView extends ChartPointView {
  reps: number
  fromWeight: number
}

interface VolumePointView {
  weekStart: string
  weekLabel: string
  totalTonnage: number
  workingSets: number
  ratio: number
  isLatest: boolean
}

interface ExerciseVolumeRow {
  name: string
  tonnage: number
  sets: number
}

const buildSbdCards = (): ExerciseCard[] => {
  const cards: ExerciseCard[] = []
  SBD_EXERCISE_NAMES.forEach((name) => {
    const def = EXERCISE_CATALOG.find((d) => d.name === name)
    if (def) {
      cards.push(toExerciseCard(def))
    } else {
      cards.push({ name, shortDesc: '', imageUrl: '', initial: name.charAt(0) || '?' })
    }
  })
  return cards
}

const topSetWeightOf = (record: TrainingRecord, exerciseName: string): number => {
  if (!record || !record.exercises) {
    return 0
  }
  let best = 0
  record.exercises.forEach((exercise) => {
    if (exercise.name !== exerciseName) {
      return
    }
    exercise.sets.forEach((set) => {
      if (set.reps === 1 && set.weight > best) {
        best = set.weight
      }
    })
  })
  return best
}

const computeRangeStart = (months: number): Date => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setMonth(start.getMonth() - months)
  return start
}

const formatShortDate = (text: string): string => {
  const date = tryParseDateText(text)
  if (!date) {
    return text
  }
  return `${date.getMonth() + 1}/${date.getDate()}`
}

interface TopSetPoint {
  date: string
  weight: number
}

const collectTopSets = (
  records: TrainingRecord[],
  exerciseName: string,
  months: number,
): TopSetPoint[] => {
  const startDate = computeRangeStart(months)
  const points: TopSetPoint[] = []
  records.forEach((record) => {
    const date = tryParseDateText(record.date)
    if (!date || date < startDate) {
      return
    }
    const weight = topSetWeightOf(record, exerciseName)
    if (weight > 0) {
      points.push({ date: record.date, weight })
    }
  })
  points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return points
}

const filterE1rmInRange = (points: E1rmPoint[], months: number): E1rmPoint[] => {
  const startDate = computeRangeStart(months)
  return points.filter((p) => {
    const d = tryParseDateText(p.date)
    return !!d && d >= startDate
  })
}

interface StatsPageData {
  tabs: TabOption[]
  activeTab: StatsTab

  exerciseCards: ExerciseCard[]
  selectedExerciseName: string
  selectedExerciseInitial: string
  selectedExerciseImage: string
  selectedExerciseDesc: string
  pickerVisible: boolean
  rangeOptions: RangeOption[]
  activeRangeId: RangeKey
  rangeLabel: string

  topChartPoints: ChartPointView[]
  topMaxWeight: number
  topMinWeight: number
  topLatestWeight: number
  topPointCount: number

  e1rmChartPoints: E1rmPointView[]
  e1rmMaxValue: number
  e1rmMinValue: number
  e1rmLatest: number
  e1rmPointCount: number
  e1rmBest: number
  e1rmBestDate: string

  weeksOptions: WeeksOption[]
  activeWeeksId: WeeksKey
  groupOptions: MuscleGroupDefinition[]
  activeGroupId: MuscleGroup
  activeGroupLabel: string
  activeGroupImage: string
  volumePoints: VolumePointView[]
  volumeMaxTonnage: number
  volumeAvgTonnage: number
  volumeTotalTonnage: number
  volumeTotalSets: number
  volumeLatestLabel: string
  volumeLatestTonnage: number
  volumeLatestSets: number
  volumeLatestBreakdown: ExerciseVolumeRow[]
}

interface StatsMethods {
  refresh(): void
  refreshTopChart(records: TrainingRecord[], months: number): void
  refreshE1rmChart(records: TrainingRecord[], months: number): void
  refreshVolume(records: TrainingRecord[], weeks: number): void
  drawLineChart(
    canvasId: string,
    points: ChartPointView[],
    maxValue: number,
    minValue: number,
    emptyText: string,
  ): void
  drawVolumeChart(points: VolumePointView[]): void
  switchTab(event: WechatMiniprogram.CustomEvent): void
  switchRange(event: WechatMiniprogram.CustomEvent): void
  switchWeeks(event: WechatMiniprogram.CustomEvent): void
  switchGroup(event: WechatMiniprogram.CustomEvent): void
  openPicker(): void
  closePicker(): void
  chooseExercise(event: WechatMiniprogram.CustomEvent): void
}

const INITIAL_CARDS = buildSbdCards()
const DEFAULT_EXERCISE = INITIAL_CARDS[0].name
const DEFAULT_GROUP: MuscleGroup = MUSCLE_GROUPS[0].id
const DEFAULT_GROUP_DEF = MUSCLE_GROUPS[0]

const INITIAL_DATA: StatsPageData = {
  tabs: TAB_OPTIONS,
  activeTab: 'top',

  exerciseCards: INITIAL_CARDS,
  selectedExerciseName: DEFAULT_EXERCISE,
  selectedExerciseInitial: DEFAULT_EXERCISE.charAt(0) || '?',
  selectedExerciseImage: getExerciseGroupImage(DEFAULT_EXERCISE),
  selectedExerciseDesc:
    (getExerciseDefinition(DEFAULT_EXERCISE) || { shortDesc: '' }).shortDesc || '',
  pickerVisible: false,
  rangeOptions: RANGE_OPTIONS,
  activeRangeId: 'year',
  rangeLabel: '1 年',

  topChartPoints: [],
  topMaxWeight: 0,
  topMinWeight: 0,
  topLatestWeight: 0,
  topPointCount: 0,

  e1rmChartPoints: [],
  e1rmMaxValue: 0,
  e1rmMinValue: 0,
  e1rmLatest: 0,
  e1rmPointCount: 0,
  e1rmBest: 0,
  e1rmBestDate: '',

  weeksOptions: WEEKS_OPTIONS,
  activeWeeksId: 'w8',
  groupOptions: MUSCLE_GROUPS,
  activeGroupId: DEFAULT_GROUP,
  activeGroupLabel: DEFAULT_GROUP_DEF.label,
  activeGroupImage: DEFAULT_GROUP_DEF.imageUrl,
  volumePoints: [],
  volumeMaxTonnage: 0,
  volumeAvgTonnage: 0,
  volumeTotalTonnage: 0,
  volumeTotalSets: 0,
  volumeLatestLabel: '',
  volumeLatestTonnage: 0,
  volumeLatestSets: 0,
  volumeLatestBreakdown: [],
}

Component<StatsPageData, Record<string, never>, StatsMethods>({
  data: INITIAL_DATA,
  lifetimes: {
    attached() {
      this.refresh()
    },
  },
  pageLifetimes: {
    show() {
      this.refresh()
    },
  },
  methods: {
    refresh() {
      const records = loadTrainingRecords()
      const range =
        RANGE_OPTIONS.find((opt) => opt.id === this.data.activeRangeId) || RANGE_OPTIONS[1]
      this.setData({ rangeLabel: range.label })
      this.refreshTopChart(records, range.months)
      this.refreshE1rmChart(records, range.months)
      const weeksOpt =
        WEEKS_OPTIONS.find((opt) => opt.id === this.data.activeWeeksId) || WEEKS_OPTIONS[1]
      this.refreshVolume(records, weeksOpt.weeks)
    },
    refreshTopChart(records: TrainingRecord[], months: number) {
      const points = collectTopSets(records, this.data.selectedExerciseName, months)
      const chartPoints: ChartPointView[] = points.map((p) => ({
        date: p.date,
        shortDate: formatShortDate(p.date),
        weight: p.weight,
      }))
      const weights = points.map((p) => p.weight)
      const maxWeight = weights.length ? Math.max.apply(null, weights) : 0
      const minWeight = weights.length ? Math.min.apply(null, weights) : 0
      const latestWeight = points.length ? points[points.length - 1].weight : 0
      this.setData({
        topChartPoints: chartPoints,
        topMaxWeight: maxWeight,
        topMinWeight: minWeight,
        topLatestWeight: latestWeight,
        topPointCount: points.length,
      })
      if (this.data.activeTab === 'top') {
        this.drawLineChart('top-chart', chartPoints, maxWeight, minWeight, '暂无 Top 组数据')
      }
    },
    refreshE1rmChart(records: TrainingRecord[], months: number) {
      const all = collectE1rmPoints(records, this.data.selectedExerciseName)
      const inRange = filterE1rmInRange(all, months)
      const chartPoints: E1rmPointView[] = inRange.map((p) => ({
        date: p.date,
        shortDate: formatShortDate(p.date),
        weight: p.e1rm,
        reps: p.reps,
        fromWeight: p.weight,
      }))
      const values = inRange.map((p) => p.e1rm)
      const maxValue = values.length ? Math.max.apply(null, values) : 0
      const minValue = values.length ? Math.min.apply(null, values) : 0
      const latest = inRange.length ? inRange[inRange.length - 1].e1rm : 0
      let best = 0
      let bestDate = ''
      all.forEach((p) => {
        if (p.e1rm > best) {
          best = p.e1rm
          bestDate = p.date
        }
      })
      this.setData({
        e1rmChartPoints: chartPoints,
        e1rmMaxValue: maxValue,
        e1rmMinValue: minValue,
        e1rmLatest: latest,
        e1rmPointCount: inRange.length,
        e1rmBest: best,
        e1rmBestDate: bestDate,
      })
      if (this.data.activeTab === 'e1rm') {
        this.drawLineChart('e1rm-chart', chartPoints, maxValue, minValue, '暂无 e1RM 数据')
      }
    },
    refreshVolume(records: TrainingRecord[], weeks: number) {
      const groupId = this.data.activeGroupId
      const groupDef = MUSCLE_GROUPS.find((g) => g.id === groupId) || DEFAULT_GROUP_DEF
      const raw: WeeklyVolumePoint[] = computeWeeklyVolume(records, weeks, groupId)
      const tonnages = raw.map((b) => b.totalTonnage)
      const maxTonnage = tonnages.length ? Math.max.apply(null, tonnages) : 0
      const totalTonnage = tonnages.reduce((s, v) => s + v, 0)
      const totalSets = raw.reduce((s, b) => s + b.workingSets, 0)
      const avgTonnage = raw.length ? Math.round(totalTonnage / raw.length) : 0
      const latest = raw[raw.length - 1]
      const volumePoints: VolumePointView[] = raw.map((b, idx) => ({
        weekStart: b.weekStart,
        weekLabel: b.weekLabel,
        totalTonnage: b.totalTonnage,
        workingSets: b.workingSets,
        ratio: maxTonnage > 0 ? b.totalTonnage / maxTonnage : 0,
        isLatest: idx === raw.length - 1,
      }))
      const latestBreakdown: ExerciseVolumeRow[] = latest
        ? latest.byExercise.map((e) => ({ name: e.name, tonnage: e.tonnage, sets: e.sets }))
        : []
      this.setData({
        activeGroupLabel: groupDef.label,
        activeGroupImage: groupDef.imageUrl,
        volumePoints,
        volumeMaxTonnage: maxTonnage,
        volumeAvgTonnage: avgTonnage,
        volumeTotalTonnage: totalTonnage,
        volumeTotalSets: totalSets,
        volumeLatestLabel: latest ? `本周 ${latest.weekLabel} · ${groupDef.label}` : '本周',
        volumeLatestTonnage: latest ? latest.totalTonnage : 0,
        volumeLatestSets: latest ? latest.workingSets : 0,
        volumeLatestBreakdown: latestBreakdown,
      })
      if (this.data.activeTab === 'volume') {
        this.drawVolumeChart(volumePoints)
      }
    },
    drawLineChart(
      canvasId: string,
      points: ChartPointView[],
      maxValue: number,
      minValue: number,
      emptyText: string,
    ) {
      const query = this.createSelectorQuery()
      query
        .select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res: WechatMiniprogram.NodeField[]) => {
          if (!res || !res[0] || !res[0].node) {
            return
          }
          const node = res[0].node as WechatMiniprogram.Canvas
          const width = res[0].width
          const height = res[0].height
          const self = this as unknown as { __dpr?: number }
          if (!self.__dpr) {
            const win = (wx as unknown as { getWindowInfo?: () => { pixelRatio: number } })
              .getWindowInfo
            self.__dpr = win ? win.call(wx).pixelRatio : wx.getSystemInfoSync().pixelRatio
          }
          const dpr = self.__dpr || 1
          node.width = width * dpr
          node.height = height * dpr
          const ctx = node.getContext('2d') as any
          ctx.scale(dpr, dpr)
          ctx.clearRect(0, 0, width, height)

          const padding = { top: 24, right: 18, bottom: 36, left: 48 }
          const chartW = width - padding.left - padding.right
          const chartH = height - padding.top - padding.bottom
          const gridColor = 'rgba(255,255,255,0.06)'
          const axisLabelColor = themeColors.textSoft
          ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'

          if (points.length === 0) {
            ctx.fillStyle = themeColors.textSoft
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(emptyText, width / 2, height / 2)
            return
          }

          let yMin = minValue
          let yMax = maxValue
          if (yMin === yMax) {
            yMin = Math.max(0, yMin - 5)
            yMax = yMax + 5
          } else {
            const span = yMax - yMin
            yMin = Math.max(0, yMin - span * 0.15)
            yMax = yMax + span * 0.15
          }

          const yTicks = 4
          ctx.strokeStyle = gridColor
          ctx.lineWidth = 1
          ctx.fillStyle = axisLabelColor
          ctx.textAlign = 'right'
          ctx.textBaseline = 'middle'
          for (let i = 0; i <= yTicks; i++) {
            const y = padding.top + (chartH * i) / yTicks
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(padding.left + chartW, y)
            ctx.stroke()
            const value = yMax - ((yMax - yMin) * i) / yTicks
            ctx.fillText(`${Math.round(value)}`, padding.left - 8, y)
          }

          const n = points.length
          const xOf = (idx: number) => {
            if (n === 1) {
              return padding.left + chartW / 2
            }
            return padding.left + (chartW * idx) / (n - 1)
          }
          const yOf = (value: number) => {
            if (yMax === yMin) {
              return padding.top + chartH / 2
            }
            return padding.top + chartH - ((value - yMin) / (yMax - yMin)) * chartH
          }

          const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH)
          gradient.addColorStop(0, 'rgba(109, 220, 208, 0.35)')
          gradient.addColorStop(1, 'rgba(109, 220, 208, 0)')

          if (n >= 2) {
            ctx.beginPath()
            ctx.moveTo(xOf(0), padding.top + chartH)
            points.forEach((p, idx) => {
              ctx.lineTo(xOf(idx), yOf(p.weight))
            })
            ctx.lineTo(xOf(n - 1), padding.top + chartH)
            ctx.closePath()
            ctx.fillStyle = gradient
            ctx.fill()
          }

          ctx.strokeStyle = themeColors.brandStrong
          ctx.lineWidth = 2
          ctx.lineJoin = 'round'
          ctx.beginPath()
          points.forEach((p, idx) => {
            const x = xOf(idx)
            const y = yOf(p.weight)
            if (idx === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          })
          ctx.stroke()

          points.forEach((p, idx) => {
            const x = xOf(idx)
            const y = yOf(p.weight)
            ctx.beginPath()
            ctx.fillStyle = themeColors.pageBg
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = themeColors.brandStrong
            ctx.lineWidth = 2
            ctx.stroke()
          })

          const labelIdxes: number[] = []
          if (n === 1) {
            labelIdxes.push(0)
          } else if (n <= 4) {
            for (let i = 0; i < n; i++) {
              labelIdxes.push(i)
            }
          } else {
            labelIdxes.push(0)
            labelIdxes.push(Math.floor((n - 1) / 2))
            labelIdxes.push(n - 1)
          }
          ctx.fillStyle = axisLabelColor
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          labelIdxes.forEach((idx) => {
            ctx.fillText(points[idx].shortDate, xOf(idx), padding.top + chartH + 8)
          })
        })
    },
    drawVolumeChart(points: VolumePointView[]) {
      const query = this.createSelectorQuery()
      query
        .select('#volume-chart')
        .fields({ node: true, size: true })
        .exec((res: WechatMiniprogram.NodeField[]) => {
          if (!res || !res[0] || !res[0].node) {
            return
          }
          const node = res[0].node as WechatMiniprogram.Canvas
          const width = res[0].width
          const height = res[0].height
          const self = this as unknown as { __dpr?: number }
          if (!self.__dpr) {
            const win = (wx as unknown as { getWindowInfo?: () => { pixelRatio: number } })
              .getWindowInfo
            self.__dpr = win ? win.call(wx).pixelRatio : wx.getSystemInfoSync().pixelRatio
          }
          const dpr = self.__dpr || 1
          node.width = width * dpr
          node.height = height * dpr
          const ctx = node.getContext('2d') as any
          ctx.scale(dpr, dpr)
          ctx.clearRect(0, 0, width, height)

          const padding = { top: 24, right: 18, bottom: 36, left: 58 }
          const chartW = width - padding.left - padding.right
          const chartH = height - padding.top - padding.bottom
          const axisLabelColor = themeColors.textSoft
          ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'

          const tonnages = points.map((p) => p.totalTonnage)
          const maxTonnage = tonnages.length ? Math.max.apply(null, tonnages) : 0
          if (maxTonnage === 0) {
            ctx.fillStyle = themeColors.textSoft
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('暂无容量数据', width / 2, height / 2)
            return
          }

          const yMax = maxTonnage * 1.15
          const yTicks = 4
          ctx.strokeStyle = 'rgba(255,255,255,0.06)'
          ctx.lineWidth = 1
          ctx.fillStyle = axisLabelColor
          ctx.textAlign = 'right'
          ctx.textBaseline = 'middle'
          for (let i = 0; i <= yTicks; i++) {
            const y = padding.top + (chartH * i) / yTicks
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(padding.left + chartW, y)
            ctx.stroke()
            const value = yMax - (yMax * i) / yTicks
            const label = value >= 1000 ? `${(value / 1000).toFixed(1)}t` : `${Math.round(value)}`
            ctx.fillText(label, padding.left - 8, y)
          }

          const n = points.length
          const slot = n > 0 ? chartW / n : chartW
          const barW = Math.max(8, Math.min(40, slot * 0.55))

          points.forEach((p, idx) => {
            const cx = padding.left + slot * (idx + 0.5)
            const h = (p.totalTonnage / yMax) * chartH
            const x = cx - barW / 2
            const y = padding.top + chartH - h
            const radius = Math.min(barW / 2, 6)
            const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartH)
            if (p.isLatest) {
              gradient.addColorStop(0, themeColors.brandStrong)
              gradient.addColorStop(1, 'rgba(109,220,208,0.25)')
            } else {
              gradient.addColorStop(0, 'rgba(109,220,208,0.7)')
              gradient.addColorStop(1, 'rgba(109,220,208,0.15)')
            }
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.moveTo(x + radius, y)
            ctx.lineTo(x + barW - radius, y)
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius)
            ctx.lineTo(x + barW, padding.top + chartH)
            ctx.lineTo(x, padding.top + chartH)
            ctx.lineTo(x, y + radius)
            ctx.quadraticCurveTo(x, y, x + radius, y)
            ctx.closePath()
            ctx.fill()
          })

          ctx.fillStyle = axisLabelColor
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          const labelIdxes: number[] = []
          if (n <= 6) {
            for (let i = 0; i < n; i++) {
              labelIdxes.push(i)
            }
          } else {
            for (let i = 0; i < n; i += Math.ceil(n / 6)) {
              labelIdxes.push(i)
            }
            if (labelIdxes[labelIdxes.length - 1] !== n - 1) {
              labelIdxes.push(n - 1)
            }
          }
          labelIdxes.forEach((idx) => {
            const cx = padding.left + slot * (idx + 0.5)
            ctx.fillText(points[idx].weekLabel, cx, padding.top + chartH + 8)
          })
        })
    },
    switchTab(event: WechatMiniprogram.CustomEvent) {
      const id = event.currentTarget.dataset.id as StatsTab
      if (!id || id === this.data.activeTab) {
        return
      }
      this.setData({ activeTab: id }, () => {
        if (id === 'top') {
          this.drawLineChart(
            'top-chart',
            this.data.topChartPoints,
            this.data.topMaxWeight,
            this.data.topMinWeight,
            '暂无 Top 组数据',
          )
        } else if (id === 'e1rm') {
          this.drawLineChart(
            'e1rm-chart',
            this.data.e1rmChartPoints,
            this.data.e1rmMaxValue,
            this.data.e1rmMinValue,
            '暂无 e1RM 数据',
          )
        } else {
          this.drawVolumeChart(this.data.volumePoints)
        }
      })
    },
    switchRange(event: WechatMiniprogram.CustomEvent) {
      const id = event.currentTarget.dataset.id as RangeKey
      if (!id || id === this.data.activeRangeId) {
        return
      }
      this.setData({ activeRangeId: id })
      this.refresh()
    },
    switchWeeks(event: WechatMiniprogram.CustomEvent) {
      const id = event.currentTarget.dataset.id as WeeksKey
      if (!id || id === this.data.activeWeeksId) {
        return
      }
      this.setData({ activeWeeksId: id })
      const records = loadTrainingRecords()
      const weeksOpt = WEEKS_OPTIONS.find((o) => o.id === id) || WEEKS_OPTIONS[1]
      this.refreshVolume(records, weeksOpt.weeks)
    },
    switchGroup(event: WechatMiniprogram.CustomEvent) {
      const id = event.currentTarget.dataset.id as MuscleGroup
      if (!id || id === this.data.activeGroupId) {
        return
      }
      this.setData({ activeGroupId: id })
      const records = loadTrainingRecords()
      const weeksOpt =
        WEEKS_OPTIONS.find((o) => o.id === this.data.activeWeeksId) || WEEKS_OPTIONS[1]
      this.refreshVolume(records, weeksOpt.weeks)
    },
    openPicker() {
      this.setData({ pickerVisible: true })
    },
    closePicker() {
      this.setData({ pickerVisible: false }, () => {
        if (this.data.activeTab === 'top') {
          this.drawLineChart(
            'top-chart',
            this.data.topChartPoints,
            this.data.topMaxWeight,
            this.data.topMinWeight,
            '暂无 Top 组数据',
          )
        } else if (this.data.activeTab === 'e1rm') {
          this.drawLineChart(
            'e1rm-chart',
            this.data.e1rmChartPoints,
            this.data.e1rmMaxValue,
            this.data.e1rmMinValue,
            '暂无 e1RM 数据',
          )
        }
      })
    },
    chooseExercise(event: WechatMiniprogram.CustomEvent) {
      const name = event.detail.name as string
      if (!name) {
        return
      }
      const def = getExerciseDefinition(name)
      this.setData({
        selectedExerciseName: name,
        selectedExerciseInitial: name.charAt(0) || '?',
        selectedExerciseImage: getExerciseGroupImage(name),
        selectedExerciseDesc: (def && def.shortDesc) || '',
        pickerVisible: false,
      })
      this.refresh()
    },
  },
})

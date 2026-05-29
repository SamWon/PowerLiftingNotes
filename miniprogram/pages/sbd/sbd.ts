import {
  EXERCISE_CATALOG,
  ExerciseCard,
  TrainingRecord,
  getExerciseDefinition,
  getExerciseGroupImage,
  loadTrainingRecords,
  toExerciseCard,
  tryParseDateText,
} from '../../utils/training/index'
import { SBD_EXERCISE_NAMES } from '../../utils/constants'
import { themeColors } from '../../utils/theme'

/** 时间范围选项。 */
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

interface TopSetPoint {
  date: string
  weight: number
}

interface ChartPointView {
  date: string
  shortDate: string
  weight: number
}

/** 构建 SBD 页可选动作卡片（按 SBD_EXERCISE_NAMES 中的顺序）。 */
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

/** 取记录中指定动作的 Top 组重量（reps===1 的最大重量）。 */
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

/** 根据时间范围过滤记录的截止日期（含）。 */
const computeRangeStart = (months: number): Date => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setMonth(start.getMonth() - months)
  return start
}

const parseDate = (text: string): Date | null => tryParseDateText(text)

const formatShortDate = (text: string): string => {
  const date = parseDate(text)
  if (!date) {
    return text
  }
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${m}/${d}`
}

/** 从所有训练记录中筛出选定动作、指定时间范围内的 Top 组数据，按日期升序。 */
const collectTopSets = (
  records: TrainingRecord[],
  exerciseName: string,
  months: number,
): TopSetPoint[] => {
  const startDate = computeRangeStart(months)
  const points: TopSetPoint[] = []
  records.forEach((record) => {
    const date = parseDate(record.date)
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

interface SbdPageData {
  exerciseCards: ExerciseCard[]
  selectedExerciseName: string
  selectedExerciseInitial: string
  selectedExerciseImage: string
  selectedExerciseDesc: string
  pickerVisible: boolean
  rangeOptions: RangeOption[]
  activeRangeId: RangeKey
  chartPoints: ChartPointView[]
  maxWeight: number
  minWeight: number
  latestWeight: number
  pointCount: number
  rangeLabel: string
}

interface SbdMethods {
  refresh(): void
  drawChart(points: ChartPointView[], maxWeight: number, minWeight: number): void
  openPicker(): void
  closePicker(): void
  chooseExercise(event: WechatMiniprogram.CustomEvent): void
  switchRange(event: WechatMiniprogram.CustomEvent): void
}

const INITIAL_CARDS = buildSbdCards()
const DEFAULT_EXERCISE = INITIAL_CARDS[0].name

const INITIAL_DATA: SbdPageData = {
  exerciseCards: INITIAL_CARDS,
  selectedExerciseName: DEFAULT_EXERCISE,
  selectedExerciseInitial: DEFAULT_EXERCISE.charAt(0) || '?',
  selectedExerciseImage: getExerciseGroupImage(DEFAULT_EXERCISE),
  selectedExerciseDesc: (getExerciseDefinition(DEFAULT_EXERCISE) || { shortDesc: '' }).shortDesc || '',
  pickerVisible: false,
  rangeOptions: RANGE_OPTIONS,
  activeRangeId: 'year',
  chartPoints: [],
  maxWeight: 0,
  minWeight: 0,
  latestWeight: 0,
  pointCount: 0,
  rangeLabel: '1 年',
}

Component<SbdPageData, Record<string, never>, SbdMethods>({
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
      const range = RANGE_OPTIONS.find((opt) => opt.id === this.data.activeRangeId) || RANGE_OPTIONS[1]
      const points = collectTopSets(records, this.data.selectedExerciseName, range.months)
      const chartPoints: ChartPointView[] = points.map((p) => ({
        date: p.date,
        shortDate: formatShortDate(p.date),
        weight: p.weight,
      }))
      const weights = points.map((p) => p.weight)
      const maxWeight = weights.length ? Math.max(...weights) : 0
      const minWeight = weights.length ? Math.min(...weights) : 0
      const latestWeight = points.length ? points[points.length - 1].weight : 0
      this.setData({
        chartPoints,
        maxWeight,
        minWeight,
        latestWeight,
        pointCount: points.length,
        rangeLabel: range.label,
      })
      this.drawChart(chartPoints, maxWeight, minWeight)
    },
    drawChart(points: ChartPointView[], maxWeight: number, minWeight: number) {
      const query = this.createSelectorQuery()
      query
        .select('#sbd-chart')
        .fields({ node: true, size: true })
        .exec((res: WechatMiniprogram.NodeField[]) => {
          if (!res || !res[0] || !res[0].node) {
            return
          }
          const node = res[0].node as WechatMiniprogram.Canvas
          const width = res[0].width
          const height = res[0].height
          // dpr 在生命周期内基本不变，缓存到组件实例上，避免每次重绘都调用 wx API。
          // wx.getSystemInfoSync 已废弃，优先用 wx.getWindowInfo。
          const self = this as unknown as { __dpr?: number }
          if (!self.__dpr) {
            const win = (wx as unknown as { getWindowInfo?: () => { pixelRatio: number } })
              .getWindowInfo
            self.__dpr = win ? win.call(wx).pixelRatio : wx.getSystemInfoSync().pixelRatio
          }
          const dpr = self.__dpr || 1
          node.width = width * dpr
          node.height = height * dpr
          // 2d canvas context（mini program 内为标准 W3C 风格 API）
          const ctx = node.getContext('2d') as any
          ctx.scale(dpr, dpr)
          ctx.clearRect(0, 0, width, height)

          const padding = { top: 24, right: 18, bottom: 36, left: 48 }
          const chartW = width - padding.left - padding.right
          const chartH = height - padding.top - padding.bottom

          // 背景网格
          const gridColor = 'rgba(255,255,255,0.06)'
          const axisLabelColor = themeColors.textSoft
          ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'

          if (points.length === 0) {
            ctx.fillStyle = themeColors.textSoft
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('暂无 Top 组数据', width / 2, height / 2)
            return
          }

          // y 轴范围扩一点 padding，避免顶/底贴边
          let yMin = minWeight
          let yMax = maxWeight
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

          // x 坐标计算
          const n = points.length
          const xOf = (idx: number) => {
            if (n === 1) {
              return padding.left + chartW / 2
            }
            return padding.left + (chartW * idx) / (n - 1)
          }
          const yOf = (weight: number) => {
            if (yMax === yMin) {
              return padding.top + chartH / 2
            }
            return padding.top + chartH - ((weight - yMin) / (yMax - yMin)) * chartH
          }

          // 渐变填充
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

          // 折线
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

          // 数据点
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

          // x 轴标签：首、尾、中间各一个，避免拥挤
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
    openPicker() {
      this.setData({ pickerVisible: true })
    },
    closePicker() {
      this.setData({ pickerVisible: false }, () => {
        this.drawChart(this.data.chartPoints, this.data.maxWeight, this.data.minWeight)
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
    switchRange(event: WechatMiniprogram.CustomEvent) {
      const id = event.currentTarget.dataset.id as RangeKey
      if (!id || id === this.data.activeRangeId) {
        return
      }
      this.setData({ activeRangeId: id })
      this.refresh()
    },
  },
})

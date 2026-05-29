/**
 * 训练容量（Volume）相关纯函数。
 *
 * 约定：
 * - tonnage（吨位） = 单组 weight × reps，汇总到周维度。
 * - working sets（有效组） = 当前简化定义为"全部已记录的组"。
 *   未来若想剔除热身组，可以按 RPE >= 6.5 等规则在此调整。
 * - "周" 以周一为起点，与国内训练计划周期习惯一致。
 */

import { TrainingRecord } from './types'
import { pad, toDateText, tryParseDateText } from './date'
import { MuscleGroup, getExerciseDefinition } from '../../config/exercises'

/** 取某日期所在周的周一（本地时间，时分秒清零）。 */
export const startOfWeek = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay() // 0=周日, 1=周一, ..., 6=周六
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export interface ExerciseVolume {
  name: string
  tonnage: number
  sets: number
}

export interface WeeklyVolumePoint {
  /** 周一日期 YYYY-MM-DD（作为唯一 key）。 */
  weekStart: string
  /** UI 上展示的简短周标签，如 "5/26"。 */
  weekLabel: string
  /** 总吨位（kg）。 */
  totalTonnage: number
  /** 有效组总数。 */
  workingSets: number
  /** 按动作拆分的容量，按 tonnage 降序。 */
  byExercise: ExerciseVolume[]
}

/**
 * 计算最近 N 周（含本周）的容量分布。
 * 返回数组长度恒为 N，按时间升序（最早 → 最近）。
 * 没有训练的周也会以 0 占位，便于绘图。
 *
 * 若传入 `muscleGroup`，只统计该肌群下的动作（按 EXERCISE_CATALOG 归类，
 * 自定义动作如果不属于该分组将被忽略）。
 */
export const computeWeeklyVolume = (
  records: TrainingRecord[],
  weeks: number,
  muscleGroup?: MuscleGroup,
): WeeklyVolumePoint[] => {
  const safeWeeks = Math.max(1, Math.floor(weeks))
  const todayWeekStart = startOfWeek(new Date())
  const buckets: WeeklyVolumePoint[] = []
  for (let i = safeWeeks - 1; i >= 0; i--) {
    const d = new Date(todayWeekStart)
    d.setDate(d.getDate() - i * 7)
    buckets.push({
      weekStart: toDateText(d),
      weekLabel: `${d.getMonth() + 1}/${pad(d.getDate())}`,
      totalTonnage: 0,
      workingSets: 0,
      byExercise: [],
    })
  }
  const byStartKey = new Map<string, WeeklyVolumePoint>()
  buckets.forEach((b) => byStartKey.set(b.weekStart, b))

  records.forEach((record) => {
    const date = tryParseDateText(record.date)
    if (!date) {
      return
    }
    const ws = toDateText(startOfWeek(date))
    const bucket = byStartKey.get(ws)
    if (!bucket) {
      return
    }
    record.exercises.forEach((exercise) => {
      if (muscleGroup) {
        const def = getExerciseDefinition(exercise.name)
        if (!def || def.muscleGroup !== muscleGroup) {
          return
        }
      }
      let exVol = bucket.byExercise.find((e) => e.name === exercise.name)
      if (!exVol) {
        exVol = { name: exercise.name, tonnage: 0, sets: 0 }
        bucket.byExercise.push(exVol)
      }
      exercise.sets.forEach((set) => {
        const t = set.weight * set.reps
        bucket.totalTonnage += t
        bucket.workingSets += 1
        // 非空引用：上面已经赋值。
        if (exVol) {
          exVol.tonnage += t
          exVol.sets += 1
        }
      })
    })
  })

  buckets.forEach((b) => {
    b.totalTonnage = Math.round(b.totalTonnage)
    b.byExercise.forEach((e) => {
      e.tonnage = Math.round(e.tonnage)
    })
    b.byExercise.sort((a, b) => b.tonnage - a.tonnage)
  })
  return buckets
}

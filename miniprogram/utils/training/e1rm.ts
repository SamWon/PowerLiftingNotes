/**
 * 估算 1RM（e1RM）相关纯函数。
 *
 * 采用 Epley 公式：`e1RM = weight × (1 + reps / 30)`。
 * - reps === 1 时直接返回 weight。
 * - reps <= 0 或 weight <= 0 时返回 0（视为无效组）。
 * 公式不限制 reps 上限，但 reps 越大估算误差越大；调用方可自行裁剪。
 */

import { TrainingRecord, TrainingSet } from './types'

/** Epley 公式 e1RM 计算。 */
export const epleyE1rm = (weight: number, reps: number): number => {
  if (!Number.isFinite(weight) || !Number.isFinite(reps)) {
    return 0
  }
  if (weight <= 0 || reps <= 0) {
    return 0
  }
  if (reps === 1) {
    return weight
  }
  return weight * (1 + reps / 30)
}

/** 单组 e1RM（保留 1 位小数）。 */
export const setE1rm = (set: TrainingSet): number => {
  const value = epleyE1rm(set.weight, set.reps)
  return value > 0 ? Math.round(value * 10) / 10 : 0
}

export interface E1rmPoint {
  /** 训练日期 YYYY-MM-DD。 */
  date: string
  /** 当天该动作的最高 e1RM（kg）。 */
  e1rm: number
  /** 来源组的实际重量与次数，便于在明细中回显。 */
  weight: number
  reps: number
}

/**
 * 从训练记录中收集某个动作的 e1RM 时间序列：
 * - 同一天取该动作所有组中 e1RM 最高的一组。
 * - 结果按日期升序排序。
 */
export const collectE1rmPoints = (
  records: TrainingRecord[],
  exerciseName: string,
): E1rmPoint[] => {
  const byDate = new Map<string, E1rmPoint>()
  records.forEach((record) => {
    record.exercises.forEach((exercise) => {
      if (exercise.name !== exerciseName) {
        return
      }
      exercise.sets.forEach((set) => {
        const value = setE1rm(set)
        if (value <= 0) {
          return
        }
        const prev = byDate.get(record.date)
        if (!prev || value > prev.e1rm) {
          byDate.set(record.date, {
            date: record.date,
            e1rm: value,
            weight: set.weight,
            reps: set.reps,
          })
        }
      })
    })
  })
  return Array.from(byDate.values()).sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  )
}

export interface E1rmBest {
  exerciseName: string
  e1rm: number
  weight: number
  reps: number
  date: string
}

export type E1rmBestMap = { [exerciseName: string]: E1rmBest }

/** 从训练记录中按动作维度计算历史最佳 e1RM。 */
export const computeE1rmBestMap = (records: TrainingRecord[]): E1rmBestMap => {
  const out: E1rmBestMap = {}
  records.forEach((record) => {
    record.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        const value = setE1rm(set)
        if (value <= 0) {
          return
        }
        const prev = out[exercise.name]
        if (!prev || value > prev.e1rm) {
          out[exercise.name] = {
            exerciseName: exercise.name,
            e1rm: value,
            weight: set.weight,
            reps: set.reps,
            date: record.date,
          }
        }
      })
    })
  })
  return out
}

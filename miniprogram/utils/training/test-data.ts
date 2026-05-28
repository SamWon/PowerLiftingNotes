/**
 * 测试数据模块。
 * 提供丰富的模拟训练数据，用于各页面功能测试。
 *
 * 切换方式：在开发者工具控制台执行：
 *   getApp().__devUseTestData = true   // 使用测试数据
 *   getApp().__devUseTestData = false  // 恢复真实数据
 * 切换后需要重新进入页面生效。
 */

import { OneRepMaxMap, TrainingRecord } from './types'

/** 生成唯一 ID */
const uid = (index: number) => `test-record-${index.toString().padStart(4, '0')}`

/**
 * 生成过去 N 天的日期字符串 (YYYY-MM-DD)
 */
const daysAgo = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  const year = d.getFullYear()
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 测试用 1RM 数据 */
export const TEST_ONE_REP_MAX: OneRepMaxMap = {
  '卧推': 120,
  '深蹲': 180,
  '低杠深蹲': 190,
  '传统硬拉': 220,
  '相扑硬拉': 210,
  '上斜卧推': 90,
  '窄距卧推': 100,
  '俯身划船': 100,
  '高位下拉': 80,
  '过头推举': 70,
}

/** 测试用训练记录 — 覆盖多种场景 */
export const TEST_TRAINING_RECORDS: TrainingRecord[] = [
  // ===== 今天 — 卧推专项 =====
  {
    id: uid(1),
    date: daysAgo(0),
    createdAt: Date.now(),
    note: '今天状态不错，卧推全程暂停稳定',
    exercises: [
      {
        name: '卧推',
        sets: [
          { reps: 5, rpe: 6, weight: 80 },
          { reps: 5, rpe: 7, weight: 90 },
          { reps: 3, rpe: 8, weight: 100 },
          { reps: 1, rpe: 9, weight: 110 },
          { reps: 1, rpe: 10, weight: 115 },
        ],
      },
      {
        name: '上斜卧推',
        sets: [
          { reps: 8, rpe: 7, weight: 60 },
          { reps: 8, rpe: 8, weight: 60 },
          { reps: 8, rpe: 8, weight: 60 },
        ],
      },
      {
        name: '窄距卧推',
        sets: [
          { reps: 10, rpe: 7, weight: 60 },
          { reps: 10, rpe: 8, weight: 60 },
        ],
      },
    ],
  },

  // ===== 2天前 — 深蹲日 =====
  {
    id: uid(2),
    date: daysAgo(2),
    createdAt: Date.now() - 2 * 86400000,
    note: '深蹲低杠位置找得还行',
    exercises: [
      {
        name: '低杠深蹲',
        sets: [
          { reps: 5, rpe: 6, weight: 120 },
          { reps: 5, rpe: 7, weight: 140 },
          { reps: 3, rpe: 8, weight: 160 },
          { reps: 1, rpe: 9, weight: 175 },
          { reps: 1, rpe: 9.5, weight: 185 },
        ],
      },
      {
        name: '深蹲',
        sets: [
          { reps: 5, rpe: 7, weight: 130 },
          { reps: 5, rpe: 8, weight: 140 },
        ],
      },
    ],
  },

  // ===== 4天前 — 硬拉日 =====
  {
    id: uid(3),
    date: daysAgo(4),
    createdAt: Date.now() - 4 * 86400000,
    exercises: [
      {
        name: '传统硬拉',
        sets: [
          { reps: 5, rpe: 6, weight: 140 },
          { reps: 3, rpe: 7, weight: 170 },
          { reps: 1, rpe: 8, weight: 190 },
          { reps: 1, rpe: 9, weight: 205 },
          { reps: 1, rpe: 10, weight: 215 },
        ],
      },
      {
        name: '俯身划船',
        sets: [
          { reps: 8, rpe: 7, weight: 70 },
          { reps: 8, rpe: 8, weight: 70 },
          { reps: 8, rpe: 8, weight: 70 },
        ],
      },
    ],
  },

  // ===== 7天前 — 卧推轻量日 =====
  {
    id: uid(4),
    date: daysAgo(7),
    createdAt: Date.now() - 7 * 86400000,
    note: '恢复训练',
    exercises: [
      {
        name: '卧推',
        sets: [
          { reps: 8, rpe: 6, weight: 70 },
          { reps: 8, rpe: 7, weight: 75 },
          { reps: 8, rpe: 7, weight: 75 },
          { reps: 8, rpe: 8, weight: 80 },
        ],
      },
      {
        name: '过头推举',
        sets: [
          { reps: 8, rpe: 7, weight: 40 },
          { reps: 8, rpe: 8, weight: 45 },
          { reps: 8, rpe: 8, weight: 45 },
        ],
      },
    ],
  },

  // ===== 10天前 — 深蹲中量日 =====
  {
    id: uid(5),
    date: daysAgo(10),
    createdAt: Date.now() - 10 * 86400000,
    exercises: [
      {
        name: '低杠深蹲',
        sets: [
          { reps: 5, rpe: 7, weight: 140 },
          { reps: 5, rpe: 7, weight: 145 },
          { reps: 5, rpe: 8, weight: 150 },
        ],
      },
      {
        name: '高位下拉',
        sets: [
          { reps: 10, rpe: 7, weight: 55 },
          { reps: 10, rpe: 8, weight: 55 },
          { reps: 10, rpe: 8, weight: 60 },
        ],
      },
    ],
  },

  // ===== 14天前 — 硬拉日 =====
  {
    id: uid(6),
    date: daysAgo(14),
    createdAt: Date.now() - 14 * 86400000,
    exercises: [
      {
        name: '相扑硬拉',
        sets: [
          { reps: 5, rpe: 6, weight: 140 },
          { reps: 3, rpe: 7, weight: 160 },
          { reps: 1, rpe: 8, weight: 180 },
          { reps: 1, rpe: 9, weight: 195 },
          { reps: 1, rpe: 9.5, weight: 205 },
        ],
      },
    ],
  },

  // ===== 18天前 — 卧推冲击 =====
  {
    id: uid(7),
    date: daysAgo(18),
    createdAt: Date.now() - 18 * 86400000,
    note: '尝试新 PR',
    exercises: [
      {
        name: '卧推',
        sets: [
          { reps: 3, rpe: 7, weight: 95 },
          { reps: 1, rpe: 8, weight: 105 },
          { reps: 1, rpe: 9, weight: 112.5 },
          { reps: 1, rpe: 10, weight: 117.5 },
        ],
      },
    ],
  },

  // ===== 21天前 — 全身训练 =====
  {
    id: uid(8),
    date: daysAgo(21),
    createdAt: Date.now() - 21 * 86400000,
    exercises: [
      {
        name: '深蹲',
        sets: [
          { reps: 5, rpe: 7, weight: 130 },
          { reps: 5, rpe: 8, weight: 140 },
          { reps: 5, rpe: 8, weight: 140 },
        ],
      },
      {
        name: '卧推',
        sets: [
          { reps: 5, rpe: 7, weight: 85 },
          { reps: 5, rpe: 7, weight: 85 },
          { reps: 5, rpe: 8, weight: 90 },
        ],
      },
      {
        name: '传统硬拉',
        sets: [
          { reps: 3, rpe: 7, weight: 160 },
          { reps: 3, rpe: 8, weight: 170 },
        ],
      },
    ],
  },

  // ===== 30天前 — 一个月前的卧推 =====
  {
    id: uid(9),
    date: daysAgo(30),
    createdAt: Date.now() - 30 * 86400000,
    exercises: [
      {
        name: '卧推',
        sets: [
          { reps: 5, rpe: 7, weight: 82.5 },
          { reps: 5, rpe: 8, weight: 87.5 },
          { reps: 3, rpe: 8, weight: 95 },
          { reps: 1, rpe: 9, weight: 107.5 },
        ],
      },
      {
        name: '窄距卧推',
        sets: [
          { reps: 10, rpe: 7, weight: 55 },
          { reps: 10, rpe: 8, weight: 55 },
          { reps: 10, rpe: 8, weight: 57.5 },
        ],
      },
    ],
  },

  // ===== 45天前 — 深蹲 PR =====
  {
    id: uid(10),
    date: daysAgo(45),
    createdAt: Date.now() - 45 * 86400000,
    note: '深蹲突破 180!',
    exercises: [
      {
        name: '低杠深蹲',
        sets: [
          { reps: 3, rpe: 7, weight: 150 },
          { reps: 1, rpe: 8, weight: 165 },
          { reps: 1, rpe: 9, weight: 175 },
          { reps: 1, rpe: 10, weight: 180 },
        ],
      },
    ],
  },

  // ===== 60天前 — 两个月前 =====
  {
    id: uid(11),
    date: daysAgo(60),
    createdAt: Date.now() - 60 * 86400000,
    exercises: [
      {
        name: '卧推',
        sets: [
          { reps: 5, rpe: 7, weight: 80 },
          { reps: 5, rpe: 8, weight: 85 },
          { reps: 3, rpe: 8, weight: 90 },
          { reps: 1, rpe: 9, weight: 100 },
        ],
      },
      {
        name: '传统硬拉',
        sets: [
          { reps: 3, rpe: 7, weight: 155 },
          { reps: 1, rpe: 8, weight: 180 },
          { reps: 1, rpe: 9, weight: 200 },
        ],
      },
    ],
  },

  // ===== 90天前 — 三个月前 =====
  {
    id: uid(12),
    date: daysAgo(90),
    createdAt: Date.now() - 90 * 86400000,
    exercises: [
      {
        name: '深蹲',
        sets: [
          { reps: 5, rpe: 7, weight: 120 },
          { reps: 5, rpe: 8, weight: 130 },
          { reps: 3, rpe: 8, weight: 140 },
          { reps: 1, rpe: 9, weight: 160 },
        ],
      },
      {
        name: '卧推',
        sets: [
          { reps: 5, rpe: 7, weight: 75 },
          { reps: 5, rpe: 8, weight: 80 },
          { reps: 3, rpe: 8, weight: 87.5 },
        ],
      },
    ],
  },

  // ===== 120天前 =====
  {
    id: uid(13),
    date: daysAgo(120),
    createdAt: Date.now() - 120 * 86400000,
    exercises: [
      {
        name: '相扑硬拉',
        sets: [
          { reps: 5, rpe: 7, weight: 130 },
          { reps: 3, rpe: 8, weight: 155 },
          { reps: 1, rpe: 9, weight: 180 },
          { reps: 1, rpe: 10, weight: 190 },
        ],
      },
    ],
  },

  // ===== 180天前 — 半年前基准 =====
  {
    id: uid(14),
    date: daysAgo(180),
    createdAt: Date.now() - 180 * 86400000,
    note: '开始系统训练',
    exercises: [
      {
        name: '卧推',
        sets: [
          { reps: 5, rpe: 7, weight: 65 },
          { reps: 5, rpe: 8, weight: 70 },
          { reps: 3, rpe: 9, weight: 80 },
          { reps: 1, rpe: 10, weight: 90 },
        ],
      },
      {
        name: '深蹲',
        sets: [
          { reps: 5, rpe: 7, weight: 100 },
          { reps: 5, rpe: 8, weight: 110 },
          { reps: 3, rpe: 9, weight: 125 },
          { reps: 1, rpe: 10, weight: 140 },
        ],
      },
      {
        name: '传统硬拉',
        sets: [
          { reps: 5, rpe: 7, weight: 120 },
          { reps: 3, rpe: 8, weight: 145 },
          { reps: 1, rpe: 9, weight: 165 },
          { reps: 1, rpe: 10, weight: 180 },
        ],
      },
    ],
  },

  // ===== 同一天多次训练（daysAgo(5) — 上午和下午） =====
  {
    id: uid(15),
    date: daysAgo(5),
    createdAt: Date.now() - 5 * 86400000 + 36000000,
    note: '上午训练 - 力量',
    exercises: [
      {
        name: '卧推',
        sets: [
          { reps: 3, rpe: 8, weight: 100 },
          { reps: 3, rpe: 8, weight: 100 },
          { reps: 3, rpe: 9, weight: 100 },
        ],
      },
    ],
  },
  {
    id: uid(16),
    date: daysAgo(5),
    createdAt: Date.now() - 5 * 86400000,
    note: '下午训练 - 辅助',
    exercises: [
      {
        name: '上斜卧推',
        sets: [
          { reps: 10, rpe: 7, weight: 50 },
          { reps: 10, rpe: 8, weight: 55 },
          { reps: 10, rpe: 8, weight: 55 },
        ],
      },
      {
        name: '俯身划船',
        sets: [
          { reps: 8, rpe: 7, weight: 65 },
          { reps: 8, rpe: 8, weight: 70 },
          { reps: 8, rpe: 8, weight: 70 },
        ],
      },
    ],
  },

  // ===== 自重训练（weight = 0）=====
  {
    id: uid(17),
    date: daysAgo(12),
    createdAt: Date.now() - 12 * 86400000,
    note: '出差，酒店自重训练',
    exercises: [
      {
        name: '俯卧撑',
        sets: [
          { reps: 20, rpe: 6, weight: 0 },
          { reps: 20, rpe: 7, weight: 0 },
          { reps: 15, rpe: 8, weight: 0 },
          { reps: 12, rpe: 9, weight: 0 },
        ],
      },
    ],
  },
]

/** 测试用动作选项列表 */
export const TEST_EXERCISE_OPTIONS: string[] = [
  '卧推',
  '深蹲',
  '低杠深蹲',
  '传统硬拉',
  '相扑硬拉',
  '上斜卧推',
  '窄距卧推',
  '俯身划船',
  '高位下拉',
  '过头推举',
  '俯卧撑',
]

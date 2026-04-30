/**
 * 训练动作目录（catalog）。
 *
 * 单独抽出，方便后续维护：
 * - 增加新的内置动作。
 * - 为每个动作补齐配图、动作说明、技术要点。
 * - 支持按 category / muscle group 做筛选。
 *
 * 注：本地存储的 exerciseOptions 仍以"动作名称数组"形式保存（向后兼容历史数据）。
 * 富信息只在 UI 展示时通过 `getExerciseDefinition(name)` 按需读取。
 */

export type ExerciseCategory = 'main' | 'accessory' | 'custom'

export interface ExerciseDefinition {
  /** 唯一 id（英文短句，可作为后续配图文件名） */
  id: string
  /** 展示名称 */
  name: string
  /** 分类：主项 / 辅助 / 自定义 */
  category: ExerciseCategory
  /** 一句话简介 */
  description?: string
  /** 技术要点（多条） */
  techniqueTips?: string[]
  /** 配图路径，预留字段，未来可指向 image/exercises/xxx.png */
  imageUrl?: string
}

export const EXERCISE_CATALOG: ExerciseDefinition[] = [
  {
    id: 'bench-press',
    name: '卧推',
    category: 'main',
    description: '力量举三大项之一，主要锻炼胸大肌、肱三头肌与三角肌前束。',
    techniqueTips: [
      '保持肩胛后缩下沉，臀部贴凳。',
      '杠铃下放至胸下沿，控制节奏。',
      '推起时手肘略内收，全程保持张力。',
    ],
  },
  {
    id: 'squat',
    name: '深蹲',
    category: 'main',
    description: '下肢力量之王，主要锻炼股四头肌、臀大肌与核心稳定。',
    techniqueTips: [
      '杠铃稳定置于斜方肌中部或后束三角肌。',
      '下蹲至大腿与地面平行或更深。',
      '保持背部中立，膝盖与脚尖同向。',
    ],
  },
  {
    id: 'deadlift',
    name: '硬拉',
    category: 'main',
    description: '后链综合训练动作，覆盖背部、臀腿与握力。',
    techniqueTips: [
      '杠铃贴近小腿，启动时髋膝同步发力。',
      '保持脊柱中立，避免圆背。',
      '锁定时髋部前推，肩胛微收。',
    ],
  },
]

/** 内置动作名称（按目录顺序）。 */
export const DEFAULT_EXERCISE_NAMES: string[] = EXERCISE_CATALOG.map(item => item.name)

/** 按名称查找动作定义；自定义动作返回 undefined。 */
export const getExerciseDefinition = (name: string): ExerciseDefinition | undefined => {
  return EXERCISE_CATALOG.find(item => item.name === name)
}

/** 是否为内置动作。 */
export const isBuiltInExercise = (name: string): boolean => {
  return EXERCISE_CATALOG.some(item => item.name === name)
}

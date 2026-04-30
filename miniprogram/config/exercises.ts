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

/** 用户视角的肌群 / 部位分组，用于动作选择器分类展示。 */
export type MuscleGroup = 'chest' | 'legs' | 'back' | 'shoulders' | 'arms' | 'core'

export interface MuscleGroupDefinition {
  id: MuscleGroup
  /** 中文短标签（一字优先，方便 tab 显示） */
  label: string
}

/** 分组顺序与展示顺序。 */
export const MUSCLE_GROUPS: MuscleGroupDefinition[] = [
  { id: 'chest', label: '胸' },
  { id: 'legs', label: '腿' },
  { id: 'back', label: '背' },
  { id: 'shoulders', label: '肩' },
  { id: 'arms', label: '手臂' },
  { id: 'core', label: '核心' },
]

export interface ExerciseDefinition {
  /** 唯一 id（英文短句，可作为后续配图文件名） */
  id: string
  /** 展示名称 */
  name: string
  /** 分类：主项 / 辅助 / 自定义 */
  category: ExerciseCategory
  /** 所属肌群分组，用于动作选择器的分类 */
  muscleGroup: MuscleGroup
  /** 一句话简介 */
  description?: string
  /** 技术要点（多条） */
  techniqueTips?: string[]
  /** 配图路径，预留字段，未来可指向 image/exercises/xxx.png */
  imageUrl?: string
}

export const EXERCISE_CATALOG: ExerciseDefinition[] = [
  // ===== 胸 =====
  {
    id: 'bench-press',
    name: '卧推',
    category: 'main',
    muscleGroup: 'chest',
    description: '力量举三大项之一，主要锻炼胸大肌、肱三头肌与三角肌前束。',
    techniqueTips: [
      '保持肩胛后缩下沉，臀部贴凳。',
      '杠铃下放至胸下沿，控制节奏。',
      '推起时手肘略内收，全程保持张力。',
    ],
  },
  { id: 'incline-bench-press', name: '上斜卧推', category: 'accessory', muscleGroup: 'chest', description: '上斜角度发力，更强调胸大肌上束与三角肌前束。' },
  { id: 'close-grip-bench-press', name: '窄距卧推', category: 'accessory', muscleGroup: 'chest', description: '握距收窄、肘部贴身，重点强化肱三头肌与卧推锁定段。' },
  { id: 'board-press', name: '木板卧推', category: 'accessory', muscleGroup: 'chest', description: '胸前垫木板限制行程，专项突破卧推中上段力量薄弱点。' },
  { id: 'paused-bench-press', name: '暂停卧推', category: 'accessory', muscleGroup: 'chest', description: '杠铃在胸口停顿 1-2 秒后推起，强化起始爆发力与稳定性。' },
  { id: 'dip', name: '臂屈伸', category: 'accessory', muscleGroup: 'chest', description: '双杠支撑下沉，自重锻炼下胸与肱三头肌，可负重进阶。' },
  { id: 'dumbbell-bench-press', name: '哑铃卧推', category: 'accessory', muscleGroup: 'chest', description: '行程更长、左右独立发力，提升胸肌发展均衡性与稳定性。' },

  // ===== 腿 =====
  {
    id: 'squat',
    name: '深蹲',
    category: 'main',
    muscleGroup: 'legs',
    description: '下肢力量之王，主要锻炼股四头肌、臀大肌与核心稳定。',
    techniqueTips: [
      '杠铃稳定置于斜方肌中部或后束三角肌。',
      '下蹲至大腿与地面平行或更深。',
      '保持背部中立，膝盖与脚尖同向。',
    ],
  },
  { id: 'low-bar-squat', name: '低杠深蹲', category: 'accessory', muscleGroup: 'legs', description: '杠铃置于后三角肌位置，髋主导发力，更能调动臀腿后链。' },
  { id: 'paused-squat', name: '暂停深蹲', category: 'accessory', muscleGroup: 'legs', description: '蹲底停顿 1-3 秒，强化底部稳定与起立爆发力。' },
  { id: 'ssb-squat', name: 'SSB深蹲', category: 'accessory', muscleGroup: 'legs', description: '使用安全杠（Safety Squat Bar），减小肩腕压力，更挑战上背与股四头。' },
  { id: 'bulgarian-split-squat', name: '保加利亚蹲', category: 'accessory', muscleGroup: 'legs', description: '后脚抬高的单腿蹲，强力刺激臀腿并改善左右不平衡。' },
  { id: 'leg-press', name: '倒蹬', category: 'accessory', muscleGroup: 'legs', description: '坐姿器械蹬腿，可大重量轰炸股四头与臀肌，对腰背更友好。' },
  { id: 'hack-squat', name: '哈克深蹲', category: 'accessory', muscleGroup: 'legs', description: '固定轨迹器械深蹲，重点孤立股四头肌，便于推到力竭。' },

  // ===== 背 =====
  { id: 'sumo-deadlift', name: '相扑硬拉', category: 'main', muscleGroup: 'back', description: '宽站距、双手内握，缩短行程并更多调用臀部与股四头。' },
  {
    id: 'conventional-deadlift',
    name: '传统硬拉',
    category: 'main',
    muscleGroup: 'back',
    description: '后链综合训练动作，覆盖背部、臀腿与握力。',
    techniqueTips: [
      '杠铃贴近小腿，启动时髋膝同步发力。',
      '保持脊柱中立，避免圆背。',
      '锁定时髋部前推，肩胛微收。',
    ],
  },
  { id: 'romanian-deadlift', name: '罗马尼亚硬拉', category: 'accessory', muscleGroup: 'back', description: '微屈膝、髋铰链下放，重点拉伸并刺激腘绳肌与臀大肌。' },
  { id: 'stiff-leg-deadlift', name: '直腿硬拉', category: 'accessory', muscleGroup: 'back', description: '近乎直腿完成髋铰链，最大化拉伸腘绳肌，提升后链柔韧与力量。' },
  { id: 'pull-up', name: '引体向上', category: 'accessory', muscleGroup: 'back', description: '自重将身体拉至下巴过杠，全面锻炼背阔肌、肱二头与握力。' },
  { id: 'seal-row', name: '海豹划船', category: 'accessory', muscleGroup: 'back', description: '俯卧高凳划船，杠铃路线固定、隔绝下肢借力，纯粹刺激背部。' },
  { id: 'seated-row', name: '坐姿划船', category: 'accessory', muscleGroup: 'back', description: '器械或拉索水平划船，重点雕刻中背与菱形肌。' },
  { id: 'bent-over-row', name: '俯身划船', category: 'accessory', muscleGroup: 'back', description: '俯身屈髋拉杠至腹部，综合提升背阔肌、中背厚度与硬拉发力姿态。' },
  { id: 'lat-pulldown', name: '高位下拉', category: 'accessory', muscleGroup: 'back', description: '坐姿向下拉横杆，可调节重量练背宽，引体能力不足者首选。' },

  // ===== 肩 =====
  { id: 'overhead-press', name: '实力推', category: 'accessory', muscleGroup: 'shoulders', description: '站姿杠铃过头推举，全身参与的肩部主项，强化三角肌与上肢稳定。' },
  { id: 'lateral-raise', name: '侧平举', category: 'accessory', muscleGroup: 'shoulders', description: '哑铃侧向抬起，孤立刺激三角肌中束，雕刻肩宽。' },
  { id: 'dumbbell-shoulder-press', name: '哑铃推肩', category: 'accessory', muscleGroup: 'shoulders', description: '坐姿或站姿哑铃推举，行程更长，左右独立发力发展三角肌前中束。' },

  // ===== 手臂 =====
  { id: 'biceps-curl', name: '二头弯举', category: 'accessory', muscleGroup: 'arms', description: '杠铃或哑铃屈肘上举，孤立锻炼肱二头肌与前臂屈肌。' },
  { id: 'triceps-pushdown', name: '飞鸟下压', category: 'accessory', muscleGroup: 'arms', description: '拉索绳索下压伸肘，孤立刺激肱三头肌外侧与长头。' },
  { id: 'skull-crusher', name: '碎颅者', category: 'accessory', muscleGroup: 'arms', description: '仰卧屈肘下放至额前，重点拉伸并强化肱三头肌长头。' },

  // ===== 核心 =====
  { id: 'crunch', name: '卷腹', category: 'accessory', muscleGroup: 'core', description: '仰卧屈髋屈躯，集中锻炼腹直肌上半部分。' },
  { id: 'hanging-leg-raise', name: '悬挂抬腿', category: 'accessory', muscleGroup: 'core', description: '悬垂在单杠上抬腿，强化下腹与髋屈肌，并训练抓握耐力。' },
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

/** 取某个分组下的所有动作（保持目录顺序）。 */
export const getExercisesByMuscleGroup = (group: MuscleGroup): ExerciseDefinition[] => {
  return EXERCISE_CATALOG.filter(item => item.muscleGroup === group)
}

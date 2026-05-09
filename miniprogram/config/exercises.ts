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
  /** 弹窗卡片简述（≤10字） */
  shortDesc?: string
  /** 动作详细介绍 */
  description?: string
  /** 目标肌群 */
  targetMuscles?: string
  /** 使用器械 */
  equipment?: string
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
    shortDesc: '胸肌力量主项',
    description: '力量举三大项之一，主要锻炼胸大肌、肱三头肌与三角肌前束。卧推是衡量上肢推力的基准动作，也是力量举比赛的标准项目。通过调整握距和下放位置可以侧重不同肌群的发力。',
    targetMuscles: '胸大肌、肱三头肌、三角肌前束',
    equipment: '杠铃、卧推架',
    techniqueTips: [
      '保持肩胛后缩下沉，臀部贴凳。',
      '杠铃下放至胸下沿，控制节奏。',
      '推起时手肘略内收，全程保持张力。',
      '双脚踩实地面，利用腿驱动传力。',
    ],
  },
  {
    id: 'incline-bench-press',
    name: '上斜卧推',
    category: 'accessory',
    muscleGroup: 'chest',
    shortDesc: '强调上胸发力',
    description: '上斜角度发力，更强调胸大肌上束与三角肌前束。角度一般设在 30°-45°，能有效弥补平板卧推对上胸刺激不足的问题。',
    targetMuscles: '胸大肌上束、三角肌前束、肱三头肌',
    equipment: '杠铃或哑铃、可调节卧推架',
    techniqueTips: [
      '凳面角度建议 30°-45°，角度过大会转移至肩部。',
      '杠铃下放至锁骨下方 2-3 指处。',
      '保持肩胛后缩，避免耸肩。',
    ],
  },
  {
    id: 'close-grip-bench-press',
    name: '窄距卧推',
    category: 'accessory',
    muscleGroup: 'chest',
    shortDesc: '强化肱三头肌',
    description: '握距收窄、肘部贴身，重点强化肱三头肌与卧推锁定段。是力量举选手提升锁定力量的经典辅助动作。',
    targetMuscles: '肱三头肌、胸大肌内侧、三角肌前束',
    equipment: '杠铃、卧推架',
    techniqueTips: [
      '握距约与肩同宽或略窄，不宜过窄伤腕。',
      '下放时肘部自然贴近身体两侧。',
      '推起时专注肱三头肌发力锁定。',
    ],
  },
  {
    id: 'board-press',
    name: '木板卧推',
    category: 'accessory',
    muscleGroup: 'chest',
    shortDesc: '突破中上段',
    description: '胸前垫木板限制行程，专项突破卧推中上段力量薄弱点。通过减小行程可以使用超大重量强化特定角度的力量。',
    targetMuscles: '胸大肌、肱三头肌',
    equipment: '杠铃、卧推架、木板（1-4 块）',
    techniqueTips: [
      '木板块数决定行程：越多块行程越短。',
      '杠铃轻触木板后立即推起，不要停顿卸力。',
      '使用比全程卧推更大的重量来超负荷训练。',
    ],
  },
  {
    id: 'paused-bench-press',
    name: '暂停卧推',
    category: 'accessory',
    muscleGroup: 'chest',
    shortDesc: '强化底部爆发',
    description: '杠铃在胸口停顿 1-2 秒后推起，强化起始爆发力与稳定性。消除拉伸反射，迫使肌肉从静止状态发力。',
    targetMuscles: '胸大肌、肱三头肌、三角肌前束',
    equipment: '杠铃、卧推架',
    techniqueTips: [
      '杠铃轻触胸口后保持全身张力，停顿 1-2 秒。',
      '停顿期间不要松懈肩胛和拱背。',
      '爆发推起，训练从静止到加速的能力。',
    ],
  },
  {
    id: 'dip',
    name: '臂屈伸',
    category: 'accessory',
    muscleGroup: 'chest',
    shortDesc: '下胸与肱三',
    description: '双杠支撑下沉，自重锻炼下胸与肱三头肌，可负重进阶。身体前倾侧重胸肌，直立侧重肱三头肌。',
    targetMuscles: '胸大肌下束、肱三头肌、三角肌前束',
    equipment: '双杠、负重腰带（进阶）',
    techniqueTips: [
      '身体略前倾 15°-30° 以侧重胸肌。',
      '下沉至上臂与地面平行，不要过深伤肩。',
      '推起时锁定手肘，全程控制速度。',
    ],
  },
  {
    id: 'dumbbell-bench-press',
    name: '哑铃卧推',
    category: 'accessory',
    muscleGroup: 'chest',
    shortDesc: '均衡胸肌发展',
    description: '行程更长、左右独立发力，提升胸肌发展均衡性与稳定性。哑铃路径更自由，对胸肌拉伸更充分。',
    targetMuscles: '胸大肌、三角肌前束、肱三头肌',
    equipment: '哑铃、卧推凳',
    techniqueTips: [
      '下放时手肘成 45°-75° 角，充分拉伸胸肌。',
      '推起时哑铃路径微向内收，但不要碰撞。',
      '注意左右均衡发力，弱侧可适当加练。',
    ],
  },

  // ===== 腿 =====
  {
    id: 'squat',
    name: '深蹲',
    category: 'main',
    muscleGroup: 'legs',
    shortDesc: '腿部力量主项',
    description: '下肢力量之王，主要锻炼股四头肌、臀大肌与核心稳定。深蹲是力量举三大项之一，也是所有运动项目的力量基础。',
    targetMuscles: '股四头肌、臀大肌、腘绳肌、核心肌群',
    equipment: '杠铃、深蹲架',
    techniqueTips: [
      '杠铃稳定置于斜方肌中部或后束三角肌。',
      '下蹲至大腿与地面平行或更深。',
      '保持背部中立，膝盖与脚尖同向。',
      '蹲起时驱动髋部向前，避免"早安式"起身。',
    ],
  },
  {
    id: 'low-bar-squat',
    name: '低杠深蹲',
    category: 'accessory',
    muscleGroup: 'legs',
    shortDesc: '髋主导后链',
    description: '杠铃置于后三角肌位置，髋主导发力，更能调动臀腿后链。低杠位使躯干前倾更多，适合力量举比赛使用。',
    targetMuscles: '臀大肌、腘绳肌、股四头肌',
    equipment: '杠铃、深蹲架',
    techniqueTips: [
      '杠铃放在后三角肌与肩胛冈之间。',
      '身体前倾角度比高杠更大，髋部后坐更多。',
      '手腕保持中立，用手掌根压杠固定。',
    ],
  },
  {
    id: 'paused-squat',
    name: '暂停深蹲',
    category: 'accessory',
    muscleGroup: 'legs',
    shortDesc: '强化底部稳定',
    description: '蹲底停顿 1-3 秒，强化底部稳定与起立爆发力。消除牵张反射，训练从最弱位置发力的能力。',
    targetMuscles: '股四头肌、臀大肌、核心肌群',
    equipment: '杠铃、深蹲架',
    techniqueTips: [
      '蹲到底部后保持全身紧张，停顿 1-3 秒。',
      '停顿时保持呼吸憋气和核心支撑。',
      '起立时爆发发力，不要先抬臀再伸膝。',
    ],
  },
  {
    id: 'ssb-squat',
    name: 'SSB深蹲',
    category: 'accessory',
    muscleGroup: 'legs',
    shortDesc: '减压挑战上背',
    description: '使用安全杠（Safety Squat Bar），减小肩腕压力，更挑战上背与股四头。SSB 的重心前移特性使上背需要更多对抗力。',
    targetMuscles: '股四头肌、上背部、核心肌群',
    equipment: '安全深蹲杠（SSB）、深蹲架',
    techniqueTips: [
      '双手抓住前方手柄，保持上背挺直。',
      '重心会比普通杠铃偏前，注意对抗前倾。',
      '适合肩部灵活性不足的训练者。',
    ],
  },
  {
    id: 'bulgarian-split-squat',
    name: '保加利亚蹲',
    category: 'accessory',
    muscleGroup: 'legs',
    shortDesc: '单腿臀腿训练',
    description: '后脚抬高的单腿蹲，强力刺激臀腿并改善左右不平衡。对平衡能力和单侧稳定性要求较高。',
    targetMuscles: '臀大肌、股四头肌、腘绳肌',
    equipment: '哑铃或杠铃、凳子',
    techniqueTips: [
      '后脚脚背放在凳面上，前脚距凳约 60-90cm。',
      '下蹲时躯干微前倾，后膝接近地面。',
      '重心始终在前脚上，感受臀腿发力。',
    ],
  },
  {
    id: 'leg-press',
    name: '倒蹬',
    category: 'accessory',
    muscleGroup: 'legs',
    shortDesc: '大重量轰炸股四',
    description: '坐姿器械蹬腿，可大重量轰炸股四头与臀肌，对腰背更友好。脚位高低可调整股四与臀部的参与比例。',
    targetMuscles: '股四头肌、臀大肌',
    equipment: '倒蹬机',
    techniqueTips: [
      '脚放踏板中间偏上，膝盖不要过度内扣。',
      '下放至膝盖约 90° 角，不要让臀部离开靠垫。',
      '推起时不要完全锁定膝盖，保持持续张力。',
    ],
  },
  {
    id: 'hack-squat',
    name: '哈克深蹲',
    category: 'accessory',
    muscleGroup: 'legs',
    shortDesc: '孤立股四头肌',
    description: '固定轨迹器械深蹲，重点孤立股四头肌，便于推到力竭。固定轨迹减少了平衡需求，可更专注肌肉发力。',
    targetMuscles: '股四头肌、臀大肌',
    equipment: '哈克深蹲机',
    techniqueTips: [
      '背部紧贴靠垫，双脚与肩同宽。',
      '下蹲深度尽量到大腿与踏板平行。',
      '脚位偏低更强调股四，偏高更多臀部参与。',
    ],
  },

  // ===== 背 =====
  {
    id: 'sumo-deadlift',
    name: '相扑硬拉',
    category: 'main',
    muscleGroup: 'back',
    shortDesc: '宽站距拉力',
    description: '宽站距、双手内握，缩短行程并更多调用臀部与股四头。适合四肢长、髋关节灵活的训练者，是力量举比赛常见站姿。',
    targetMuscles: '臀大肌、股四头肌、内收肌、竖脊肌',
    equipment: '杠铃',
    techniqueTips: [
      '站距宽于肩 1.5-2 倍，脚尖外展 45°。',
      '双手在两腿之间握杠，握距与肩同宽。',
      '启动时推地展髋，保持胸椎挺直。',
    ],
  },
  {
    id: 'conventional-deadlift',
    name: '传统硬拉',
    category: 'main',
    muscleGroup: 'back',
    shortDesc: '后链综合训练',
    description: '后链综合训练动作，覆盖背部、臀腿与握力。传统硬拉是力量举三大项之一，也是评估全身拉力的黄金标准动作。',
    targetMuscles: '竖脊肌、臀大肌、腘绳肌、斜方肌、前臂',
    equipment: '杠铃',
    techniqueTips: [
      '杠铃贴近小腿，启动时髋膝同步发力。',
      '保持脊柱中立，避免圆背。',
      '锁定时髋部前推，肩胛微收。',
      '下放时先屈髋后屈膝，杠铃沿大腿下滑。',
    ],
  },
  {
    id: 'romanian-deadlift',
    name: '罗马尼亚硬拉',
    category: 'accessory',
    muscleGroup: 'back',
    shortDesc: '拉伸腘绳肌',
    description: '微屈膝、髋铰链下放，重点拉伸并刺激腘绳肌与臀大肌。是强化硬拉起始段和改善后链柔韧性的经典辅助动作。',
    targetMuscles: '腘绳肌、臀大肌、竖脊肌',
    equipment: '杠铃或哑铃',
    techniqueTips: [
      '膝盖微屈固定不动，主要靠髋铰链下放。',
      '杠铃沿大腿前侧下滑，感受腘绳肌拉伸。',
      '下放到腘绳肌明显拉伸即可，不需触地。',
    ],
  },
  {
    id: 'stiff-leg-deadlift',
    name: '直腿硬拉',
    category: 'accessory',
    muscleGroup: 'back',
    shortDesc: '后链柔韧力量',
    description: '近乎直腿完成髋铰链，最大化拉伸腘绳肌，提升后链柔韧与力量。与罗马尼亚硬拉相比膝盖弯曲更少。',
    targetMuscles: '腘绳肌、竖脊肌、臀大肌',
    equipment: '杠铃或哑铃',
    techniqueTips: [
      '双腿几乎完全伸直，仅微屈保护膝关节。',
      '以髋为轴心前屈，感受后链充分拉伸。',
      '使用较轻重量，注重动作质量和拉伸感。',
    ],
  },
  {
    id: 'pull-up',
    name: '引体向上',
    category: 'accessory',
    muscleGroup: 'back',
    shortDesc: '自重练背宽',
    description: '自重将身体拉至下巴过杠，全面锻炼背阔肌、肱二头与握力。是衡量上肢拉力和体重力量比的经典动作。',
    targetMuscles: '背阔肌、肱二头肌、大圆肌、前臂',
    equipment: '单杠、负重腰带（进阶）',
    techniqueTips: [
      '握距略宽于肩，正握（掌心朝前）为主。',
      '启动时肩胛下沉后缩，用背部发力引体。',
      '下巴过杠后控制下放，不要完全松懈。',
    ],
  },
  {
    id: 'seal-row',
    name: '海豹划船',
    category: 'accessory',
    muscleGroup: 'back',
    shortDesc: '纯粹刺激背部',
    description: '俯卧高凳划船，杠铃路线固定、隔绝下肢借力，纯粹刺激背部。是消除借力、孤立训练背部的优秀动作。',
    targetMuscles: '背阔肌、菱形肌、中斜方肌',
    equipment: '杠铃或哑铃、高凳',
    techniqueTips: [
      '俯卧在高凳上，胸部贴紧凳面。',
      '双手自然下垂握杠，拉至腹部位置。',
      '顶峰收缩 1 秒，全程不借助身体晃动。',
    ],
  },
  {
    id: 'seated-row',
    name: '坐姿划船',
    category: 'accessory',
    muscleGroup: 'back',
    shortDesc: '雕刻中背',
    description: '器械或拉索水平划船，重点雕刻中背与菱形肌。坐姿固定下肢，可以更专注于背部肌肉的收缩。',
    targetMuscles: '菱形肌、中斜方肌、背阔肌',
    equipment: '拉索器械、V 型把手',
    techniqueTips: [
      '坐姿挺胸，双脚踩稳踏板。',
      '拉至腹部时肩胛后缩，挤压背部肌肉。',
      '控制离心阶段，缓慢回放不要甩重量。',
    ],
  },
  {
    id: 'bent-over-row',
    name: '俯身划船',
    category: 'accessory',
    muscleGroup: 'back',
    shortDesc: '背阔肌厚度',
    description: '俯身屈髋拉杠至腹部，综合提升背阔肌、中背厚度与硬拉发力姿态。是自由重量划船中最经典的背部训练动作。',
    targetMuscles: '背阔肌、菱形肌、竖脊肌、肱二头肌',
    equipment: '杠铃',
    techniqueTips: [
      '屈髋约 45° 角，背部保持平直。',
      '拉至下腹部位置，肘部贴近身体。',
      '顶峰时肩胛后缩，控制下放节奏。',
    ],
  },
  {
    id: 'lat-pulldown',
    name: '高位下拉',
    category: 'accessory',
    muscleGroup: 'back',
    shortDesc: '替代引体练背宽',
    description: '坐姿向下拉横杆，可调节重量练背宽，引体能力不足者首选。通过调整握距和把手类型可侧重不同背部区域。',
    targetMuscles: '背阔肌、大圆肌、肱二头肌',
    equipment: '高位下拉器',
    techniqueTips: [
      '握距宽于肩 1.5 倍，掌心朝前。',
      '下拉时肩胛下沉后缩，拉至锁骨上方。',
      '躯干微后倾 10°-15°，避免过度后仰借力。',
    ],
  },

  // ===== 肩 =====
  {
    id: 'overhead-press',
    name: '实力推',
    category: 'accessory',
    muscleGroup: 'shoulders',
    shortDesc: '站姿过头推举',
    description: '站姿杠铃过头推举，全身参与的肩部主项，强化三角肌与上肢稳定。是最具功能性的上肢推力动作之一。',
    targetMuscles: '三角肌前束、肱三头肌、上斜方肌',
    equipment: '杠铃、深蹲架',
    techniqueTips: [
      '杠铃起始位置在锁骨前方，握距略宽于肩。',
      '推起时头部微后撤让杠铃直线上升。',
      '锁定后杠铃在头顶正上方，身体成一条直线。',
    ],
  },
  {
    id: 'lateral-raise',
    name: '侧平举',
    category: 'accessory',
    muscleGroup: 'shoulders',
    shortDesc: '孤立三角肌中束',
    description: '哑铃侧向抬起，孤立刺激三角肌中束，雕刻肩宽。是打造宽肩视觉效果的必备动作。',
    targetMuscles: '三角肌中束',
    equipment: '哑铃',
    techniqueTips: [
      '手肘微屈固定，侧向抬起至与肩同高。',
      '小拇指侧微微上翻，增强中束刺激。',
      '使用轻重量高次数，注重肌肉收缩感。',
    ],
  },
  {
    id: 'dumbbell-shoulder-press',
    name: '哑铃推肩',
    category: 'accessory',
    muscleGroup: 'shoulders',
    shortDesc: '三角肌前中束',
    description: '坐姿或站姿哑铃推举，行程更长，左右独立发力发展三角肌前中束。比杠铃推举更能暴露和纠正左右不平衡。',
    targetMuscles: '三角肌前束、三角肌中束、肱三头肌',
    equipment: '哑铃、有靠背的训练凳',
    techniqueTips: [
      '起始位置哑铃在耳朵两侧，手肘约 90°。',
      '推起时哑铃路径微向内收，顶部不碰撞。',
      '背靠凳面减少腰部代偿，专注肩部发力。',
    ],
  },

  // ===== 手臂 =====
  {
    id: 'biceps-curl',
    name: '二头弯举',
    category: 'accessory',
    muscleGroup: 'arms',
    shortDesc: '练肱二头肌',
    description: '杠铃或哑铃屈肘上举，孤立锻炼肱二头肌与前臂屈肌。是最基础也是最有效的二头肌训练动作。',
    targetMuscles: '肱二头肌、肱肌、前臂屈肌',
    equipment: '杠铃、哑铃或 EZ 杠',
    techniqueTips: [
      '上臂贴紧身体两侧固定不动。',
      '屈肘上举至顶峰收缩 1 秒。',
      '控制离心下放，不要甩动借力。',
    ],
  },
  {
    id: 'triceps-pushdown',
    name: '飞鸟下压',
    category: 'accessory',
    muscleGroup: 'arms',
    shortDesc: '刺激肱三头肌',
    description: '拉索绳索下压伸肘，孤立刺激肱三头肌外侧与长头。通过不同把手（直杆、V 杆、绳索）可侧重不同头。',
    targetMuscles: '肱三头肌外侧头、长头',
    equipment: '拉索器械、直杆或绳索把手',
    techniqueTips: [
      '上臂贴紧身体固定，只有前臂运动。',
      '完全伸直手肘至锁定，顶峰收缩。',
      '使用绳索时，底部双手外翻加强外侧头刺激。',
    ],
  },
  {
    id: 'skull-crusher',
    name: '碎颅者',
    category: 'accessory',
    muscleGroup: 'arms',
    shortDesc: '肱三头肌长头',
    description: '仰卧屈肘下放至额前，重点拉伸并强化肱三头肌长头。是增加肱三头肌整体维度的经典动作。',
    targetMuscles: '肱三头肌长头、内侧头',
    equipment: 'EZ 杠或哑铃、卧推凳',
    techniqueTips: [
      '仰卧握杠，上臂微后倾保持张力。',
      '屈肘下放至额头或头顶上方。',
      '伸肘推起时保持上臂稳定不晃动。',
    ],
  },

  // ===== 核心 =====
  {
    id: 'crunch',
    name: '卷腹',
    category: 'accessory',
    muscleGroup: 'core',
    shortDesc: '锻炼上腹',
    description: '仰卧屈髋屈躯，集中锻炼腹直肌上半部分。是腹部训练中最基础的动作，适合所有训练水平。',
    targetMuscles: '腹直肌上部',
    equipment: '瑜伽垫、负重片（进阶）',
    techniqueTips: [
      '双手轻触耳侧或交叉放胸前，不要抱头。',
      '卷起时只需肩胛离地，不要做完整仰卧起坐。',
      '呼气卷起、吸气回落，全程腹部保持紧张。',
    ],
  },
  {
    id: 'hanging-leg-raise',
    name: '悬挂抬腿',
    category: 'accessory',
    muscleGroup: 'core',
    shortDesc: '强化下腹',
    description: '悬垂在单杠上抬腿，强化下腹与髋屈肌，并训练抓握耐力。难度较大，可从屈膝版本逐步进阶到直腿。',
    targetMuscles: '腹直肌下部、髋屈肌',
    equipment: '单杠',
    techniqueTips: [
      '悬垂时身体稳定不摇晃，核心收紧。',
      '抬腿至大腿与地面平行或更高。',
      '控制下放速度，不要靠惯性摆动。',
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

/** 取某个分组下的所有动作（保持目录顺序）。 */
export const getExercisesByMuscleGroup = (group: MuscleGroup): ExerciseDefinition[] => {
  return EXERCISE_CATALOG.filter(item => item.muscleGroup === group)
}

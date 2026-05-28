/**
 * 动作选择器相关的共享类型和工具函数。
 * 由 exercise-picker 组件及各页面共用。
 */
import {
  ExerciseDefinition,
  EXERCISE_CATALOG,
  MUSCLE_GROUPS,
  MuscleGroup,
  getExerciseDefinition,
} from '../../config/exercises'

export interface ExerciseCard {
  name: string
  shortDesc: string
  imageUrl: string
  /** 当 imageUrl 缺失时，用作占位图的中文首字。 */
  initial: string
}

export interface ExerciseGroupView {
  id: MuscleGroup
  label: string
  imageUrl: string
  cards: ExerciseCard[]
}

/** 根据动作名称获取其所属肌群分组的配图。 */
export const getExerciseGroupImage = (name: string): string => {
  const def = getExerciseDefinition(name)
  if (def) {
    const group = MUSCLE_GROUPS.find(g => g.id === def.muscleGroup)
    return group ? group.imageUrl : ''
  }
  return ''
}

/** 把 ExerciseDefinition 转为卡片视图对象（不使用分组图作为 imageUrl）。 */
export const toExerciseCard = (def: ExerciseDefinition): ExerciseCard => ({
  name: def.name,
  shortDesc: def.shortDesc || '',
  imageUrl: def.imageUrl || '',
  initial: def.name.charAt(0) || '?',
})

/** 按分组生成动作卡片列表（仅包含该分组下有动作的组）。 */
export const buildExerciseGroups = (): ExerciseGroupView[] => {
  return MUSCLE_GROUPS
    .map(group => ({
      id: group.id,
      label: group.label,
      imageUrl: group.imageUrl,
      cards: EXERCISE_CATALOG.filter(def => def.muscleGroup === group.id).map(toExerciseCard),
    }))
    .filter(view => view.cards.length > 0)
}

/** 根据动作名称推断它属于哪个分组（找不到时返回第一个分组）。 */
export const resolveGroupOfExercise = (name: string, groups: ExerciseGroupView[]): MuscleGroup => {
  const def = getExerciseDefinition(name)
  if (def) {
    return def.muscleGroup
  }
  return (groups[0] ? groups[0].id : undefined) || 'chest'
}

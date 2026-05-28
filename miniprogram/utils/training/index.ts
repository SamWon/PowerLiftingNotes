/**
 * 训练相关工具的统一出口（barrel）。
 * 页面继续 `import { ... } from '../../utils/training'` 即可。
 */

export * from './types'
export * from './date'
export * from './records'
export * from './storage'
export * from './import-export'
export * from './migration'
export * from './dev-switch'
export * from './exercise-ui'

// 便于直接获取动作目录
export {
  DEFAULT_EXERCISE_NAMES as DEFAULT_EXERCISES,
  EXERCISE_CATALOG,
  MUSCLE_GROUPS,
  getExerciseDefinition,
  getExercisesByMuscleGroup,
  isBuiltInExercise,
} from '../../config/exercises'
export type {
  ExerciseCategory,
  ExerciseDefinition,
  MuscleGroup,
  MuscleGroupDefinition,
} from '../../config/exercises'

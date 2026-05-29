/**
 * 全局常量。集中维护 storage key、上限阈值、正则等，避免散落在各页面里出现 magic value。
 *
 * 修改 storage key 会导致历史数据无法读取，请谨慎。
 */

/** 本地存储 key。 */
export const STORAGE_KEYS = {
  TRAINING_RECORDS: 'powerlifting_training_records',
  EXERCISES: 'powerlifting_exercises',
  ONE_REP_MAX: 'powerlifting_one_rep_max',
  /** 临时存放“正在编辑的 record id”，跨页传值用。 */
  EDITING_RECORD_ID: 'powerlifting_editing_record_id',
  /** App 首次启动标记。 */
  APP_READY: 'powerlifting_app_ready',
  /** logs 页面的启动日志列表。 */
  LOGS: 'logs',
  /** 开发者模式：使用测试数据。 */
  DEV_USE_TEST_DATA: '__devUseTestData',
} as const

/** 备注最大长度（与 create.wxml 中 maxlength 保持一致）。 */
export const MAX_NOTE_LENGTH = 60

/** RPE 合法区间。 */
export const RPE_MIN = 1
export const RPE_MAX = 10

/** 导入文件单文件大小上限（5 MB）。 */
export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024
/** 一次最多导入文件数。 */
export const MAX_IMPORT_FILES = 20

/** ISO 日期（YYYY-MM-DD）正则。 */
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/** SBD 页可选动作（按显示顺序）。 */
export const SBD_EXERCISE_NAMES = ['卧推', '深蹲', '低杠深蹲', '传统硬拉', '相扑硬拉'] as const

import { isTrainingRecord, normalizeRecord } from './records'
import { TrainingRecord } from './types'

/**
 * 导出 / 导入 数据格式版本号。
 * 后续修改字段结构时递增，并在 migration.ts 中追加迁移逻辑。
 *
 * v2 起 TrainingSet 增加 `weight` 字段（kg）。
 * 导入旧版本（缺失 weight）时按 0 兜底，保持向后兼容。
 */
export const EXPORT_FORMAT_VERSION = 2

export interface ExportPayload {
  app: string
  version: number
  exportedAt: string
  records: TrainingRecord[]
}

export const buildExportPayload = (records: TrainingRecord[]): ExportPayload => ({
  app: 'PowerLiftingNotes',
  version: EXPORT_FORMAT_VERSION,
  exportedAt: new Date().toISOString(),
  records,
})

/**
 * 解析导入文件。兼容三种格式：
 * 1. 当前 ExportPayload（推荐）。
 * 2. 旧版本 ExportPayload（无 weight，导入时兜底为 0）。
 * 3. 历史版本：直接是 TrainingRecord[]。
 */
export const normalizeImportedRecords = (content: string): TrainingRecord[] => {
  // JSON.parse 失败会原样抛出 SyntaxError，让调用方按需处理（页面会展示"JSON 格式错误"）。
  const parsed = JSON.parse(content) as ExportPayload | TrainingRecord[]
  const rawRecords = Array.isArray(parsed) ? parsed : parsed && parsed.records
  if (!Array.isArray(rawRecords)) {
    throw new Error('文件格式不符（缺少 records 数组）')
  }
  const records = rawRecords.map(record =>
    record && typeof record === 'object' ? normalizeRecord(record) : record,
  )
  const firstInvalidIndex = records.findIndex(record => !isTrainingRecord(record))
  if (firstInvalidIndex !== -1) {
    throw new Error(`第 ${firstInvalidIndex + 1} 条记录字段不完整或非法`)
  }
  return records
}

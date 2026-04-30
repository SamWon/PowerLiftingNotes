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
  const parsed = JSON.parse(content) as ExportPayload | TrainingRecord[]
  const rawRecords = Array.isArray(parsed) ? parsed : parsed.records
  if (!Array.isArray(rawRecords)) {
    throw new Error('Invalid training records file')
  }
  const records = rawRecords.map(record =>
    record && typeof record === 'object' ? normalizeRecord(record) : record,
  )
  if (!records.every(isTrainingRecord)) {
    throw new Error('Invalid training records file')
  }
  return records
}

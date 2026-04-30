import { isTrainingRecord } from './records'
import { TrainingRecord } from './types'

/**
 * 导出 / 导入 数据格式版本号。
 * 后续修改字段结构时递增，并在 migration.ts 中追加迁移逻辑。
 */
export const EXPORT_FORMAT_VERSION = 1

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
 * 解析导入文件。兼容两种格式：
 * 1. 完整 ExportPayload（推荐）。
 * 2. 历史版本：直接是 TrainingRecord[]。
 */
export const normalizeImportedRecords = (content: string): TrainingRecord[] => {
  const parsed = JSON.parse(content) as ExportPayload | TrainingRecord[]
  const records = Array.isArray(parsed) ? parsed : parsed.records
  if (!Array.isArray(records) || !records.every(isTrainingRecord)) {
    throw new Error('Invalid training records file')
  }
  return records
}

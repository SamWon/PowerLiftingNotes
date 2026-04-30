/**
 * 训练数据格式迁移。
 *
 * 当前格式 version = 1，尚无需迁移。
 * 未来若新增字段（如重量 weight、动作 id 等），在此追加 migrators 函数链：
 *
 *   const migrators: Record<number, (records: any[]) => any[]> = {
 *     1: records => records.map(addWeightField),  // v1 -> v2
 *     2: records => records.map(addExerciseId),   // v2 -> v3
 *   }
 *
 * 然后在 normalizeImportedRecords 中按 version 顺序调用对应 migrator。
 */

import { EXPORT_FORMAT_VERSION } from './import-export'

export const CURRENT_DATA_VERSION = EXPORT_FORMAT_VERSION

/** 占位：未来在此返回升级后的 records。当前直接返回原数据。 */
export const migrateRecords = <T>(records: T[], _fromVersion: number): T[] => {
  return records
}

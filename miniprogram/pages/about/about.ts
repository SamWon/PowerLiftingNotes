import {
  ExportPayload,
  TrainingRecord,
  buildExportPayload,
  countSets,
  loadTrainingRecords,
  normalizeImportedRecords,
  saveTrainingRecords,
  toDateText,
} from '../../utils/training/index'
import { MAX_IMPORT_FILE_BYTES, MAX_IMPORT_FILES } from '../../utils/constants'
import { themeColors } from '../../utils/theme'

interface ShareFileMessageOption {
  filePath: string
  fileName?: string
  success?: () => void
  fail?: (res: WechatMiniprogram.GeneralCallbackResult) => void
}

Component({
  data: {
    records: [] as TrainingRecord[],
    totalWorkouts: 0,
    totalSets: 0,
  },
  lifetimes: {
    attached() {
      this.loadSummary()
    },
  },
  pageLifetimes: {
    show() {
      this.loadSummary()
    },
  },
  methods: {
    loadSummary() {
      const records = loadTrainingRecords()
      this.setData({ records, totalWorkouts: records.length, totalSets: countSets(records) })
    },
    exportRecords() {
      const payload: ExportPayload = buildExportPayload(this.data.records)
      const jsonStr = JSON.stringify(payload, null, 2)
      const fileName = `力量举训练记录_${toDateText(new Date())}.json`
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
      wx.getFileSystemManager().writeFile({
        filePath,
        data: jsonStr,
        encoding: 'utf8',
        success: () => this.shareExportedFile(filePath, fileName, jsonStr),
        fail: () => wx.showToast({ title: '导出失败', icon: 'none' }),
      })
    },
    shareExportedFile(filePath: string, fileName: string, jsonStr: string) {
      // 优先尝试保存到本地磁盘（PC 微信可用）
      wx.saveFileToDisk({
        filePath,
        success: () => wx.showToast({ title: '文件已保存到本地', icon: 'success' }),
        fail: () => {
          // PC 不可用时，尝试通过微信转发文件（手机端）
          const wxWithShare = wx as unknown as { shareFileMessage?: (option: ShareFileMessageOption) => void }
          if (typeof wxWithShare.shareFileMessage === 'function') {
            wxWithShare.shareFileMessage({
              filePath,
              fileName,
              success: () => wx.showToast({ title: '文件已分享', icon: 'success' }),
              fail: () => this.copyJsonToClipboard(jsonStr),
            })
          } else {
            this.copyJsonToClipboard(jsonStr)
          }
        },
      })
    },
    copyJsonToClipboard(jsonStr: string) {
      wx.setClipboardData({
        data: jsonStr,
        success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'success' }),
        fail: () => wx.showToast({ title: '导出失败', icon: 'none' }),
      })
    },
    importRecords() {
      wx.showModal({
        title: '导入会覆盖当前数据',
        content: '请选择一个或多个导出的 JSON 文件。导入成功后，现有训练记录会被覆盖。',
        confirmText: '继续导入',
        confirmColor: themeColors.brandStrong,
        success: (modalResult) => {
          if (!modalResult.confirm) {
            return
          }
          wx.chooseMessageFile({
            count: MAX_IMPORT_FILES,
            type: 'file',
            extension: ['json'],
            success: (chooseResult) => this.readImportFiles(chooseResult.tempFiles),
          })
        },
      })
    },
    readImportFiles(files: WechatMiniprogram.ChooseFile[]) {
      if (files.length === 0) {
        return
      }
      // 事先检查文件体积，避免误选超大文件导致 OOM 或 UI 卡死。
      const tooBig = files.find(file => typeof file.size === 'number' && file.size > MAX_IMPORT_FILE_BYTES)
      if (tooBig) {
        wx.showModal({
          title: '文件过大',
          content: `${tooBig.name || '选中的文件'} 超过 ${Math.round(MAX_IMPORT_FILE_BYTES / 1024 / 1024)} MB，请检查后重试。`,
          showCancel: false,
        })
        return
      }
      const fileManager = wx.getFileSystemManager()
      const tasks = files.map(file => new Promise<TrainingRecord[]>((resolve, reject) => {
        fileManager.readFile({
          filePath: file.path,
          encoding: 'utf8',
          success: (result) => {
            try {
              resolve(normalizeImportedRecords(String(result.data)))
            } catch (error) {
              // 包装原始错误，保留文件名便于下轮开互。
              const wrapped = new Error(
                error instanceof Error ? error.message : 'Unknown parse error',
              ) as Error & { fileName?: string }
              wrapped.fileName = file.name
              reject(wrapped)
            }
          },
          fail: (err) => reject(Object.assign(new Error(err.errMsg || '读取失败'), { fileName: file.name })),
        })
      }))
      Promise.all(tasks)
        .then(groups => {
          const records = groups.reduce((all, group) => all.concat(group), [] as TrainingRecord[])
          saveTrainingRecords(records)
          this.loadSummary()
          wx.showToast({ title: '导入完成', icon: 'success' })
        })
        .catch((error: Error & { fileName?: string }) => {
          const fileLabel = error && error.fileName ? `《${error.fileName}》` : ''
          const reason = error instanceof SyntaxError
            ? 'JSON 格式错误'
            : (error && error.message) || '未知错误'
          wx.showModal({
            title: '导入失败',
            content: `${fileLabel}${reason}。\n请确认使用的是本应用导出的 JSON 文件。`,
            showCancel: false,
          })
        })
    },
  },
})
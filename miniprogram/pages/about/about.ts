import {
  ExportPayload,
  TrainingRecord,
  countSets,
  loadTrainingRecords,
  normalizeImportedRecords,
  saveTrainingRecords,
  toDateText,
} from '../../utils/training'

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
      const payload: ExportPayload = {
        app: 'PowerLiftingNotes',
        version: 1,
        exportedAt: new Date().toISOString(),
        records: this.data.records,
      }
      const fileName = `力量举训练记录_${toDateText(new Date())}.json`
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
      wx.getFileSystemManager().writeFile({
        filePath,
        data: JSON.stringify(payload, null, 2),
        encoding: 'utf8',
        success: () => this.shareExportedFile(filePath, fileName),
        fail: () => wx.showToast({ title: '导出失败', icon: 'none' }),
      })
    },
    shareExportedFile(filePath: string, fileName: string) {
      const wxWithShare = wx as unknown as { shareFileMessage?: (option: ShareFileMessageOption) => void }
      if (typeof wxWithShare.shareFileMessage === 'function') {
        wxWithShare.shareFileMessage({
          filePath,
          fileName,
          success: () => wx.showToast({ title: '已生成导出文件', icon: 'success' }),
          fail: () => wx.showToast({ title: '已取消导出', icon: 'none' }),
        })
        return
      }
      wx.saveFileToDisk({
        filePath,
        success: () => wx.showToast({ title: '已保存文件', icon: 'success' }),
        fail: () => wx.showModal({
          title: '导出文件已生成',
          content: `文件路径：${filePath}`,
          showCancel: false,
        }),
      })
    },
    importRecords() {
      wx.showModal({
        title: '导入会覆盖当前数据',
        content: '请选择一个或多个导出的 JSON 文件。导入成功后，现有训练记录会被覆盖。',
        confirmText: '继续导入',
        confirmColor: '#23d3a6',
        success: (modalResult) => {
          if (!modalResult.confirm) {
            return
          }
          wx.chooseMessageFile({
            count: 20,
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
      const fileManager = wx.getFileSystemManager()
      const tasks = files.map(file => new Promise<TrainingRecord[]>((resolve, reject) => {
        fileManager.readFile({
          filePath: file.path,
          encoding: 'utf8',
          success: (result) => {
            try {
              resolve(normalizeImportedRecords(String(result.data)))
            } catch (error) {
              reject(error)
            }
          },
          fail: reject,
        })
      }))
      Promise.all(tasks)
        .then(groups => {
          const records = groups.reduce((all, group) => all.concat(group), [] as TrainingRecord[])
          saveTrainingRecords(records)
          this.loadSummary()
          wx.showToast({ title: '导入完成', icon: 'success' })
        })
        .catch(() => wx.showModal({
          title: '导入失败',
          content: '文件内容无法识别，请确认使用的是本应用导出的 JSON 文件。',
          showCancel: false,
        }))
    },
  },
})
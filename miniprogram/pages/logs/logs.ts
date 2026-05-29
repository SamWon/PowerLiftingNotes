// logs.ts
import { formatTime } from '../../utils/util'
import { STORAGE_KEYS } from '../../utils/constants'

Component({
  data: {
    logs: [] as Array<{ date: string; timeStamp: string }>,
  },
  lifetimes: {
    attached() {
      const raw = (wx.getStorageSync(STORAGE_KEYS.LOGS) || []) as string[]
      this.setData({
        logs: raw.map((log: string) => ({
          date: formatTime(new Date(log)),
          timeStamp: log,
        })),
      })
    },
  },
})

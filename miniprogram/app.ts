// app.ts
import { themeColors } from './utils/theme'
import { STORAGE_KEYS } from './utils/constants'

const applyTabBarTheme = () => {
  wx.setTabBarStyle({
    color: themeColors.tabBarColor,
    selectedColor: themeColors.tabBarColorActive,
    backgroundColor: themeColors.tabBarBg,
    borderStyle: 'white',
  })
}

App<IAppOption>({
  globalData: {},
  onLaunch() {
    wx.setStorageSync(STORAGE_KEYS.APP_READY, true)
    applyTabBarTheme()
    wx.onThemeChange(() => applyTabBarTheme())
  },
})
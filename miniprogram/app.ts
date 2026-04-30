// app.ts
import { themeColors } from './utils/theme'

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
    wx.setStorageSync('powerlifting_app_ready', true)
    applyTabBarTheme()
    wx.onThemeChange(() => applyTabBarTheme())
  },
})
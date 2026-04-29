// app.ts
const applyTabBarTheme = () => {
  wx.setTabBarStyle({
    color: '#758895',
    selectedColor: '#23d3a6',
    backgroundColor: '#0e1620',
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
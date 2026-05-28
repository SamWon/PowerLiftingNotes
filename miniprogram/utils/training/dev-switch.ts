/**
 * 开发/测试数据源切换器。
 *
 * 使用方式（在微信开发者工具控制台中执行）：
 *
 *   wx.setStorageSync('__devUseTestData', true)   // 启用测试数据
 *   wx.setStorageSync('__devUseTestData', false)  // 恢复真实数据
 *
 * 切换后重新进入页面即可生效（页面会在 onShow/attached 中重新 load 数据）。
 * 该标记持久化在本地存储中，刷新/重启后仍然有效。
 *
 * 原理：storage.ts 的 load 函数在读取数据时检查开关，
 * 若开启则返回 test-data.ts 中的测试数据，否则正常读取本地存储。
 * save 函数在测试模式下为空操作，保护真实数据不被覆写。
 */

const DEV_SWITCH_KEY = '__devUseTestData'

/**
 * 判断当前是否处于测试数据模式。
 * 通过读取本地存储中的标记来决定，避免依赖 getApp()。
 */
export const isTestDataMode = (): boolean => {
  try {
    return wx.getStorageSync(DEV_SWITCH_KEY) === true
  } catch {
    return false
  }
}

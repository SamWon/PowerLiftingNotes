/**
 * 设计令牌（design tokens）— TS 侧。
 *
 * 用于无法读取 CSS 变量的 wx 原生 API：
 *   wx.setTabBarStyle / wx.showModal({ confirmColor }) / wx.setNavigationBarColor 等。
 *
 * 与 styles/theme.less 一一对应。修改时请同步两边。
 */

export const themeColors = {
  pageBg: '#070a10',
  surface: '#10151f',

  text: '#f5f8fc',
  textSoft: '#c4cdde',
  textOnBrand: '#ffffff',

  brand: '#4f8cff',
  brandStrong: '#6ddcd0',

  danger: '#ff5d75',

  tabBarBg: '#0e1620',
  tabBarColor: '#758895',
  tabBarColorActive: '#23d3a6',
} as const

export type ThemeColorKey = keyof typeof themeColors

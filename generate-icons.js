/**
 * 从 SVG 生成 PNG 图标：
 * - tabBar 图标（record / create / about）生成灰色 + 绿色两个版本
 * - 页面内图标（date / delete / save）生成对应颜色版本
 *
 * 用法: node generate-icons.js
 */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const ICON_DIR = path.join(__dirname, 'miniprogram', 'assets', 'icon')
const SIZE = 81 // 微信推荐 tabBar 图标尺寸

const COLORS = {
  inactive: '#758895',
  active: '#23d3a6',
  danger: '#ff5d75',
  white: '#ffffff',
  brand: '#4f8cff',
}

// tabBar 图标：生成 inactive + active 两个版本
const TAB_ICONS = ['record', 'create', 'about']

// 页面内图标：指定颜色
const PAGE_ICONS = [
  { name: 'date', color: COLORS.active },
  { name: 'delete', color: COLORS.danger },
  { name: 'save', color: COLORS.white },
]

function colorizeSvg(svgContent, color) {
  // 给所有 path 添加 fill 颜色，移除可能存在的 stroke
  let svg = svgContent
    .replace(/<svg/, `<svg fill="${color}"`)
    .replace(/fill="none"/g, `fill="${color}"`)
  return svg
}

async function generatePng(svgPath, outputPath, color, size) {
  const svgContent = fs.readFileSync(svgPath, 'utf-8')
  const colorized = colorizeSvg(svgContent, color)
  await sharp(Buffer.from(colorized))
    .resize(size, size)
    .png()
    .toFile(outputPath)
  console.log(`  ✓ ${path.basename(outputPath)}`)
}

async function main() {
  console.log('Generating icons...\n')

  // tabBar 图标
  for (const name of TAB_ICONS) {
    const svgPath = path.join(ICON_DIR, `${name}.svg`)
    if (!fs.existsSync(svgPath)) {
      console.warn(`  ✗ ${name}.svg not found, skipping`)
      continue
    }
    await generatePng(svgPath, path.join(ICON_DIR, `${name}.png`), COLORS.inactive, SIZE)
    await generatePng(svgPath, path.join(ICON_DIR, `${name}-active.png`), COLORS.active, SIZE)
  }

  // 页面内图标
  for (const { name, color } of PAGE_ICONS) {
    const svgPath = path.join(ICON_DIR, `${name}.svg`)
    if (!fs.existsSync(svgPath)) {
      console.warn(`  ✗ ${name}.svg not found, skipping`)
      continue
    }
    await generatePng(svgPath, path.join(ICON_DIR, `${name}.png`), color, SIZE)
  }

  console.log('\nDone!')
}

main().catch(console.error)

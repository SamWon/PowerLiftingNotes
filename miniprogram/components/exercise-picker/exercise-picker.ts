Component({
  properties: {
    /** 是否显示弹窗 */
    show: { type: Boolean, value: false },
    /** 模式：'grouped' 分组展示（带 tab），'flat' 平铺展示 */
    mode: { type: String, value: 'flat' },
    /** 当前选中的动作名称 */
    selectedName: { type: String, value: '' },
    /** flat 模式使用的卡片列表 */
    exerciseCards: { type: Array, value: [] },
    /** grouped 模式使用的分组列表（含 cards 子数组） */
    exerciseGroups: { type: Array, value: [] },
    /** grouped 模式当前激活的分组 id */
    activeGroupId: { type: String, value: '' },
  },
  methods: {
    onClose() {
      this.triggerEvent('close')
    },
    onSelect(event: WechatMiniprogram.CustomEvent) {
      const name = event.currentTarget.dataset.name as string
      if (name) {
        this.triggerEvent('select', { name })
      }
    },
    onSwitchGroup(event: WechatMiniprogram.CustomEvent) {
      const id = event.currentTarget.dataset.id as string
      this.triggerEvent('switchgroup', { id })
    },
  },
})

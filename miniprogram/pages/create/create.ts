import {
  DEFAULT_EXERCISES,
  DraftSet,
  ExerciseCard,
  ExerciseGroupView,
  MuscleGroup,
  OneRepMaxMap,
  TrainingExercise,
  TrainingRecord,
  TrainingSet,
  buildExerciseGroups,
  computeE1rmBestMap,
  createDefaultSet,
  getExerciseDefinition,
  getExerciseGroupImage,
  loadOneRepMaxMap,
  loadTrainingRecords,
  mergeExercises,
  resolveGroupOfExercise,
  saveOneRepMaxMap,
  saveTrainingRecords,
  setE1rm,
  toDateText,
} from '../../utils/training/index'
import { STORAGE_KEYS } from '../../utils/constants'

interface ExerciseDetailView {
  name: string
  description: string
  targetMuscles: string[]
  equipment: string
  techniqueTips: string[]
}

const EDITING_KEY = STORAGE_KEYS.EDITING_RECORD_ID

/** 把 1RM × 百分比按 0.5kg 精度换算成 kg，便于杠铃配重。 */
const computeWeightFromPercent = (oneRepMax: number, percent: number) => {
  if (!Number.isFinite(oneRepMax) || !Number.isFinite(percent) || oneRepMax <= 0) {
    return NaN
  }
  return Math.round((oneRepMax * percent / 100) * 2) / 2
}

/** 把 weight 反推为 1RM 的百分比（取整到 1%）。 */
const computePercentFromWeight = (oneRepMax: number, weight: number) => {
  if (!Number.isFinite(oneRepMax) || !Number.isFinite(weight) || oneRepMax <= 0) {
    return NaN
  }
  return Math.round((weight / oneRepMax) * 100)
}

/** 把已保存的 set 还原为 DraftSet（用于编辑模式预填）。 */
const setToDraft = (set: TrainingSet, oneRepMax: number): DraftSet => {
  const percent = computePercentFromWeight(oneRepMax, set.weight)
  return {
    reps: String(set.reps),
    rpe: String(set.rpe),
    weight: set.weight > 0 ? String(set.weight) : '',
    percent: Number.isFinite(percent) ? String(percent) : '',
    inputMode: 'weight',
  }
}

const INITIAL_GROUPS = buildExerciseGroups()

/** 根据动作名称构建详情视图。 */
const toDetailView = (name: string): ExerciseDetailView => {
  const def = getExerciseDefinition(name)
  return {
    name,
    description: (def && def.description) || '',
    targetMuscles: ((def && def.targetMuscles) || '').split('、').filter(Boolean),
    equipment: (def && def.equipment) || '',
    techniqueTips: (def && def.techniqueTips) || [],
  }
}

interface CreatePageData {
  exercises: string[]
  exerciseGroups: ExerciseGroupView[]
  activeGroupId: MuscleGroup
  exercisePickerVisible: boolean
  exerciseDetailVisible: boolean
  selectedExerciseDetail: ExerciseDetailView
  selectedExerciseName: string
  selectedExerciseInitial: string
  selectedExerciseImage: string
  selectedOneRepMax: number
  oneRepMaxMap: OneRepMaxMap
  draftSets: DraftSet[]
  todayText: string
  currentDate: string
  editingRecordId: string
  isEditing: boolean
  note: string
}

const INITIAL_DATA: CreatePageData = {
  exercises: DEFAULT_EXERCISES,
  exerciseGroups: INITIAL_GROUPS,
  activeGroupId: resolveGroupOfExercise(DEFAULT_EXERCISES[0], INITIAL_GROUPS),
  exercisePickerVisible: false,
  exerciseDetailVisible: false,
  selectedExerciseDetail: toDetailView(DEFAULT_EXERCISES[0]),
  selectedExerciseName: DEFAULT_EXERCISES[0],
  selectedExerciseInitial: DEFAULT_EXERCISES[0].charAt(0) || '?',
  selectedExerciseImage: getExerciseGroupImage(DEFAULT_EXERCISES[0]),
  selectedOneRepMax: 0,
  oneRepMaxMap: {},
  draftSets: [createDefaultSet()],
  todayText: toDateText(new Date()),
  currentDate: toDateText(new Date()),
  editingRecordId: '',
  isEditing: false,
  note: '',
}

Component({
  data: INITIAL_DATA,
  lifetimes: {
    attached() {
      this.loadExerciseData()
      this.syncNoteForDate(this.data.currentDate)
    },
  },
  pageLifetimes: {
    show() {
      this.loadExerciseData()
      this.consumeEditingIntent()
      this.syncNoteForDate(this.data.currentDate)
    },
  },
  methods: {
    loadExerciseData() {
      const oneRepMaxMap = loadOneRepMaxMap()
      const exercises = DEFAULT_EXERCISES
      // exerciseGroups 是从静态 config 构建的，整个页面生命周期内不会变；
      // 复用 INITIAL_GROUPS 避免每次 onShow 都带着 30+ 动作定义重新 setData。
      const exerciseGroups = this.data.exerciseGroups.length ? this.data.exerciseGroups : INITIAL_GROUPS
      const selected = exercises.includes(this.data.selectedExerciseName)
        ? this.data.selectedExerciseName
        : exercises[0]
      this.setData({
        exercises,
        activeGroupId: resolveGroupOfExercise(selected, exerciseGroups),
        selectedExerciseName: selected,
        selectedExerciseInitial: selected.charAt(0) || '?',
        selectedExerciseImage: getExerciseGroupImage(selected),
        selectedExerciseDetail: toDetailView(selected),
        oneRepMaxMap,
        selectedOneRepMax: oneRepMaxMap[selected] || 0,
      })
    },
    /** 进入编辑模式：从临时 storage 读取目标 record 并预填表单。 */
    consumeEditingIntent() {
      const id = wx.getStorageSync(EDITING_KEY) as string | ''
      if (!id) {
        return
      }
      wx.removeStorageSync(EDITING_KEY)
      const record = loadTrainingRecords().find(item => item.id === id)
      if (!record) {
        return
      }
      const oneRepMaxMap = this.data.oneRepMaxMap
      // 简化后的编辑模式：仅编辑该记录的第一个动作；保存时整条记录被覆盖。
      const first = record.exercises[0]
      const firstName = first ? first.name : this.data.selectedExerciseName
      const firstOneRepMax = oneRepMaxMap[firstName] || 0
      const draftSets: DraftSet[] = first
        ? first.sets.map(set => setToDraft(set, firstOneRepMax))
        : [createDefaultSet()]
      this.setData({
        editingRecordId: record.id,
        isEditing: true,
        currentDate: record.date,
        selectedExerciseName: firstName,
        selectedExerciseInitial: firstName.charAt(0) || '?',
        selectedExerciseImage: getExerciseGroupImage(firstName),
        selectedExerciseDetail: toDetailView(firstName),
        selectedOneRepMax: firstOneRepMax,
        draftSets,
        note: record.note || '',
      })
    },
    /** 在新增模式下，根据当前日期查询是否已有记录的 note，预填到输入框。 */
    syncNoteForDate(date: string) {
      if (this.data.isEditing) {
        return
      }
      const existing = loadTrainingRecords().find(record => record.date === date)
      this.setData({ note: (existing ? existing.note : undefined) || '' })
    },
    cancelEditing() {
      this.setData({
        editingRecordId: '',
        isEditing: false,
        draftSets: [createDefaultSet()],
        currentDate: toDateText(new Date()),
        note: '',
      })
      wx.switchTab({ url: '/pages/index/index' })
    },
    openExercisePicker() {
      // 打开时把 tab 切到当前选中动作所属分组，避免用户找不到当前动作。
      // exerciseGroups 在 attached 时已初始化，打开选择器时只需更新 visible + activeGroupId，
      // 不再重复传输 30+ 个动作定义到 view 层。
      this.setData({
        exercisePickerVisible: true,
        activeGroupId: resolveGroupOfExercise(this.data.selectedExerciseName, this.data.exerciseGroups),
      })
    },
    closeExercisePicker() {
      this.setData({ exercisePickerVisible: false })
    },
    switchExerciseGroup(event: any) {
      const activeGroupId = event.detail.id as MuscleGroup
      this.setData({ activeGroupId })
    },
    chooseExercise(event: any) {
      const selectedExerciseName = event.detail.name as string
      const oneRepMax = this.data.oneRepMaxMap[selectedExerciseName] || 0
      const draftSets = oneRepMax > 0
        ? this.data.draftSets
        : this.data.draftSets.map(set =>
            set.inputMode === 'percent' ? { ...set, inputMode: 'weight' as const } : set,
          )
      this.setData({
        selectedExerciseName,
        selectedExerciseInitial: selectedExerciseName.charAt(0) || '?',
        selectedExerciseImage: getExerciseGroupImage(selectedExerciseName),
        selectedOneRepMax: oneRepMax,
        selectedExerciseDetail: toDetailView(selectedExerciseName),
        exercisePickerVisible: false,
        draftSets,
      })
    },
    openExerciseDetail() {
      this.setData({ exerciseDetailVisible: true })
    },
    closeExerciseDetail() {
      this.setData({ exerciseDetailVisible: false })
    },
    editOneRepMax() {
      const name = this.data.selectedExerciseName
      const current = this.data.oneRepMaxMap[name] || 0
      wx.showModal({
        title: `${name} 1RM`,
        // editable=true 时，content 会变成输入框的初始值；
        // 用当前 1RM 作为默认值（无则留空），提示语放到 placeholderText。
        content: current > 0 ? String(current) : '',
        editable: true,
        placeholderText: '填写 1RM（kg），留空清除',
        success: (res) => {
          if (!res.confirm) {
            return
          }
          const raw = (res.content || '').trim()
          const oneRepMaxMap: OneRepMaxMap = { ...this.data.oneRepMaxMap }
          if (raw === '') {
            delete oneRepMaxMap[name]
          } else {
            const value = Number(raw)
            if (!Number.isFinite(value) || value <= 0) {
              wx.showToast({ title: '请输入大于 0 的数字', icon: 'none' })
              return
            }
            oneRepMaxMap[name] = Math.round(value * 2) / 2
          }
          saveOneRepMaxMap(oneRepMaxMap)
          const nextDraftSets = !oneRepMaxMap[name]
            ? this.data.draftSets.map(set =>
                set.inputMode === 'percent' ? { ...set, inputMode: 'weight' as const } : set,
              )
            : this.data.draftSets
          this.setData({
            oneRepMaxMap,
            selectedOneRepMax: oneRepMaxMap[name] || 0,
            draftSets: nextDraftSets,
          })
        },
      })
    },
    onDateChange(event: any) {
      const currentDate = event.detail.value as string
      this.setData({ currentDate })
      this.syncNoteForDate(currentDate)
    },
    onNoteInput(event: any) {
      this.setData({ note: event.detail.value })
    },
    onSetRepsInput(event: any) {
      const index = Number(event.currentTarget.dataset.index)
      const draftSets = [...this.data.draftSets]
      draftSets[index] = { ...draftSets[index], reps: event.detail.value }
      this.setData({ draftSets })
    },
    onSetRpeInput(event: any) {
      const index = Number(event.currentTarget.dataset.index)
      const draftSets = [...this.data.draftSets]
      draftSets[index] = { ...draftSets[index], rpe: event.detail.value }
      this.setData({ draftSets })
    },
    onSetWeightInput(event: any) {
      const index = Number(event.currentTarget.dataset.index)
      const draftSets = [...this.data.draftSets]
      const weight = event.detail.value as string
      const oneRepMax = this.data.selectedOneRepMax
      const numWeight = Number(weight)
      const percent = oneRepMax > 0 && weight !== '' && Number.isFinite(numWeight)
        ? String(computePercentFromWeight(oneRepMax, numWeight))
        : draftSets[index].percent
      draftSets[index] = { ...draftSets[index], weight, percent }
      this.setData({ draftSets })
    },
    onSetPercentInput(event: any) {
      const index = Number(event.currentTarget.dataset.index)
      const draftSets = [...this.data.draftSets]
      const percent = event.detail.value as string
      const oneRepMax = this.data.selectedOneRepMax
      const numPercent = Number(percent)
      let weight = draftSets[index].weight
      if (oneRepMax > 0 && percent !== '' && Number.isFinite(numPercent)) {
        const value = computeWeightFromPercent(oneRepMax, numPercent)
        weight = Number.isFinite(value) ? String(value) : ''
      }
      draftSets[index] = { ...draftSets[index], percent, weight }
      this.setData({ draftSets })
    },
    toggleSetInputMode(event: any) {
      const index = Number(event.currentTarget.dataset.index)
      const draftSets = [...this.data.draftSets]
      const current = draftSets[index]
      const oneRepMax = this.data.selectedOneRepMax
      if (oneRepMax <= 0) {
        wx.showToast({ title: '先设置当前动作 1RM', icon: 'none' })
        return
      }
      const nextMode = current.inputMode === 'weight' ? 'percent' : 'weight'
      draftSets[index] = { ...current, inputMode: nextMode }
      this.setData({ draftSets })
    },
    addSet() {
      this.setData({ draftSets: [...this.data.draftSets, createDefaultSet()] })
    },
    removeSet(event: any) {
      const index = Number(event.currentTarget.dataset.index)
      if (this.data.draftSets.length === 1) {
        wx.showToast({ title: '至少保留一组', icon: 'none' })
        return
      }
      this.setData({ draftSets: this.data.draftSets.filter((_, setIndex) => setIndex !== index) })
    },
    /** 把当前草稿组组装成 TrainingExercise，校验失败返回 null 并提示。 */
    collectCurrentExercise() {
      if (!this.data.selectedExerciseName) {
        wx.showToast({ title: '请选择动作', icon: 'none' })
        return null
      }
      const sets: TrainingSet[] = []
      for (const draft of this.data.draftSets) {
        const reps = Number(draft.reps)
        const rpe = Number(draft.rpe)
        const weight = draft.weight === '' ? 0 : Number(draft.weight)
        if (!Number.isFinite(reps) || reps <= 0) {
          wx.showToast({ title: '次数需大于 0', icon: 'none' })
          return null
        }
        if (!Number.isFinite(rpe) || rpe < 1 || rpe > 10) {
          wx.showToast({ title: 'RPE 需在 1-10', icon: 'none' })
          return null
        }
        if (!Number.isFinite(weight) || weight < 0) {
          wx.showToast({ title: '重量需为非负数', icon: 'none' })
          return null
        }
        sets.push({ reps, rpe, weight })
      }
      return { name: this.data.selectedExerciseName, sets }
    },
    saveRecord() {
      const currentExercise = this.collectCurrentExercise()
      if (!currentExercise) {
        return
      }
      const date = this.data.currentDate
      const newExercises = [currentExercise]
      const noteText = (this.data.note || '').trim()
      const records = loadTrainingRecords()
      let nextRecords: TrainingRecord[]
      if (this.data.isEditing && this.data.editingRecordId) {
        // 编辑模式：直接替换原 record 的 exercises、date 与 note。
        nextRecords = records.map(record =>
          record.id === this.data.editingRecordId
            ? { ...record, date, exercises: newExercises, note: noteText || undefined }
            : record,
        )
      } else {
        // 新增模式：若同日已有记录则合并 exercises（同名动作合并 sets），note 直接覆盖。
        const existing = records.find(record => record.date === date)
        if (existing) {
          nextRecords = records.map(record =>
            record.id === existing.id
              ? {
                  ...record,
                  exercises: mergeExercises(record.exercises, newExercises),
                  note: noteText || undefined,
                }
              : record,
          )
        } else {
          const record: TrainingRecord = {
            id: `record_${Date.now()}`,
            date,
            createdAt: Date.now(),
            exercises: newExercises,
            note: noteText || undefined,
          }
          nextRecords = [record, ...records]
        }
      }
      const wasEditing = this.data.isEditing
      // e1RM PR 检测：与"保存前"的历史最佳对比，超过则提示。
      // 仅在新增模式下检测（编辑模式会替换原记录，导致旧值难以界定）。
      let prToast: { exerciseName: string; e1rm: number } | null = null
      if (!wasEditing) {
        const prevBestMap = computeE1rmBestMap(records)
        const exerciseName = currentExercise.name
        const prevBest = prevBestMap[exerciseName] ? prevBestMap[exerciseName].e1rm : 0
        let bestInBatch = 0
        currentExercise.sets.forEach(set => {
          const v = setE1rm(set)
          if (v > bestInBatch) {
            bestInBatch = v
          }
        })
        if (bestInBatch > prevBest && bestInBatch > 0) {
          prToast = { exerciseName, e1rm: bestInBatch }
        }
      }
      saveTrainingRecords(nextRecords)
      this.setData({
        draftSets: [createDefaultSet()],
        currentDate: toDateText(new Date()),
        editingRecordId: '',
        isEditing: false,
        note: '',
      })
      if (prToast) {
        wx.showToast({
          title: `${prToast.exerciseName} e1RM 新高 ${prToast.e1rm}kg`,
          icon: 'none',
          duration: 2400,
        })
      } else {
        wx.showToast({ title: wasEditing ? '已更新' : '已保存', icon: 'success' })
      }
      wx.switchTab({ url: '/pages/index/index' })
    },
  },
})

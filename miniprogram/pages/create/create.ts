import {
  DEFAULT_EXERCISES,
  DraftSet,
  ExerciseDefinition,
  TrainingExercise,
  TrainingRecord,
  createDefaultSet,
  getExerciseDefinition,
  isTrainingSet,
  loadExerciseOptions,
  loadTrainingRecords,
  saveExerciseOptions,
  saveTrainingRecords,
  toDateText,
} from '../../utils/training/index'

interface ExerciseCard {
  name: string
  description: string
  imageUrl: string
}

const buildExerciseCards = (names: string[]): ExerciseCard[] => {
  return names.map(name => {
    const def: ExerciseDefinition | undefined = getExerciseDefinition(name)
    return {
      name,
      description: def?.description || '自定义动作',
      imageUrl: def?.imageUrl || '',
    }
  })
}

Component({
  data: {
    exercises: DEFAULT_EXERCISES,
    exerciseCards: buildExerciseCards(DEFAULT_EXERCISES) as ExerciseCard[],
    exercisePickerVisible: false,
    newExerciseName: '',
    selectedExerciseName: DEFAULT_EXERCISES[0],
    draftSets: [createDefaultSet()] as DraftSet[],
    draftExercises: [] as TrainingExercise[],
    todayText: toDateText(new Date()),
    currentDate: toDateText(new Date()),
  },
  lifetimes: {
    attached() {
      this.loadExerciseData()
    },
  },
  pageLifetimes: {
    show() {
      this.loadExerciseData()
    },
  },
  methods: {
    loadExerciseData() {
      const exercises = loadExerciseOptions()
      this.setData({
        exercises,
        exerciseCards: buildExerciseCards(exercises),
        selectedExerciseName: exercises.includes(this.data.selectedExerciseName) ? this.data.selectedExerciseName : exercises[0],
      })
    },
    openExercisePicker() {
      this.setData({ exercisePickerVisible: true })
    },
    closeExercisePicker() {
      this.setData({ exercisePickerVisible: false, newExerciseName: '' })
    },
    chooseExercise(event: any) {
      const selectedExerciseName = event.currentTarget.dataset.name as string
      this.setData({ selectedExerciseName, exercisePickerVisible: false, newExerciseName: '' })
    },
    onNewExerciseInput(event: any) {
      this.setData({ newExerciseName: event.detail.value.trim() })
    },
    addExerciseOption() {
      const name = this.data.newExerciseName.trim()
      if (!name) {
        wx.showToast({ title: '请输入动作名称', icon: 'none' })
        return
      }
      if (this.data.exercises.includes(name)) {
        wx.showToast({ title: '动作已存在', icon: 'none' })
        return
      }
      const exercises = [...this.data.exercises, name]
      saveExerciseOptions(exercises)
      this.setData({ exercises, exerciseCards: buildExerciseCards(exercises), selectedExerciseName: name, exercisePickerVisible: false, newExerciseName: '' })
    },
    onDateChange(event: any) {
      this.setData({ currentDate: event.detail.value })
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
    collectCurrentExercise() {
      const sets = this.data.draftSets.map(set => ({
        reps: Number(set.reps),
        rpe: Number(set.rpe),
      }))
      if (!this.data.selectedExerciseName) {
        wx.showToast({ title: '请选择动作', icon: 'none' })
        return null
      }
      if (!sets.every(isTrainingSet)) {
        wx.showToast({ title: '次数需大于0，RPE为1-10', icon: 'none' })
        return null
      }
      return { name: this.data.selectedExerciseName, sets }
    },
    addDraftExercise() {
      const exercise = this.collectCurrentExercise()
      if (!exercise) {
        return
      }
      this.setData({
        draftExercises: [...this.data.draftExercises, exercise],
        draftSets: [createDefaultSet()],
      })
    },
    removeDraftExercise(event: any) {
      const index = Number(event.currentTarget.dataset.index)
      this.setData({ draftExercises: this.data.draftExercises.filter((_, exerciseIndex) => exerciseIndex !== index) })
    },
    saveRecord() {
      const currentExercise = this.collectCurrentExercise()
      if (!currentExercise) {
        return
      }
      const record: TrainingRecord = {
        id: `record_${Date.now()}`,
        date: this.data.currentDate,
        createdAt: Date.now(),
        exercises: [...this.data.draftExercises, currentExercise],
      }
      saveTrainingRecords([record, ...loadTrainingRecords()])
      this.setData({
        draftExercises: [],
        draftSets: [createDefaultSet()],
        currentDate: toDateText(new Date()),
      })
      wx.showToast({ title: '已保存', icon: 'success' })
      wx.switchTab({ url: '/pages/index/index' })
    },
    noop() {
      return
    },
  },
})
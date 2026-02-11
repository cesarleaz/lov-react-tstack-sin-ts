import { create } from 'zustand'

const useConfigsStore = create((set) => ({
  initCanvas: false,
  setInitCanvas: (initCanvas) => set({ initCanvas }),
  textModels: [],
  setTextModels: (models) => set({ textModels: models }),
  textModel: undefined,
  setTextModel: (model) => set({ textModel: model }),
  showInstallDialog: false,
  setShowInstallDialog: (show) => set({ showInstallDialog: show }),
  showUpdateDialog: false,
  setShowUpdateDialog: (show) => set({ showUpdateDialog: show }),
  showSettingsDialog: false,
  setShowSettingsDialog: (show) => set({ showSettingsDialog: show }),
  showLoginDialog: false,
  setShowLoginDialog: (show) => set({ showLoginDialog: show }),
  providers: {},
  setProviders: (providers) => set({ providers }),
  allTools: [],
  setAllTools: (tools) => set({ allTools: tools }),
  selectedTools: [],
  setSelectedTools: (tools) => set({ selectedTools: tools })
}))

export default useConfigsStore

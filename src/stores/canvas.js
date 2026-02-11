import { create } from 'zustand'

const useCanvasStore = create((set) => ({
  canvasId: '',
  excalidrawAPI: null,
  setCanvasId: (canvasId) => set({ canvasId }),
  setExcalidrawAPI: (excalidrawAPI) => set({ excalidrawAPI })
}))

export default useCanvasStore

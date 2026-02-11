import { create } from 'zustand'
import { listCanvases } from '@/api/canvas'

const useCanvasesStore = create((set) => ({
  data: [],
  status: 'idle',
  error: null,
  lastFetchedAt: 0,
  fetchCanvases: async ({ force = false } = {}) => {
    set((state) => {
      if (state.status === 'loading' && !force) {
        return state
      }
      return { status: 'loading', error: null }
    })

    try {
      const data = await listCanvases()
      set({
        data: Array.isArray(data) ? data : [],
        status: 'success',
        error: null,
        lastFetchedAt: Date.now()
      })
      return data
    } catch (error) {
      set({ status: 'error', error })
      throw error
    }
  },
  invalidate: () => set({ lastFetchedAt: 0 }),
  clear: () => set({ data: [], status: 'idle', error: null, lastFetchedAt: 0 })
}))

export default useCanvasesStore

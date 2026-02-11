import { create } from 'zustand'
import { listModels } from '@/api/model'

const STALE_TIME = 1000

const useModelsStore = create((set, get) => ({
  data: null,
  status: 'idle',
  error: null,
  lastFetchedAt: 0,
  isStale: () => Date.now() - get().lastFetchedAt > STALE_TIME,
  invalidate: () => set({ lastFetchedAt: 0 }),
  fetchModels: async ({ force = false } = {}) => {
    const { status, lastFetchedAt, data } = get()
    if (!force && lastFetchedAt && Date.now() - lastFetchedAt <= STALE_TIME) {
      return data
    }
    if (status === 'loading') {
      return data
    }

    // Mantenemos data previa para evitar parpadeos de UI (stale-while-revalidate).
    set({ status: 'loading', error: null })
    try {
      const nextData = await listModels()
      set({
        data: nextData,
        status: 'success',
        error: null,
        lastFetchedAt: Date.now()
      })
      return nextData
    } catch (error) {
      set({ status: 'error', error })
      throw error
    }
  }
}))

export default useModelsStore

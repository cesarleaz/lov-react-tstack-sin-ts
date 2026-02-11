import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { listCanvases } from '@/api/canvas'
import { idbStorage } from './idb-storage'

const useCanvasesStore = create(
  persist(
    (set) => ({
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
      clear: () =>
        set({ data: [], status: 'idle', error: null, lastFetchedAt: 0 })
    }),
    {
      name: 'server-state-canvases',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        data: state.data,
        lastFetchedAt: state.lastFetchedAt
      })
    }
  )
)

export default useCanvasesStore

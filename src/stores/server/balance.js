import { create } from 'zustand'
import { getBalance } from '@/api/billing'

const STALE_TIME = 30 * 1000
const GC_TIME = 5 * 60 * 1000

const useBalanceStore = create((set, get) => ({
  data: null,
  status: 'idle',
  error: null,
  lastFetchedAt: 0,
  gcTimer: null,
  isStale: () => Date.now() - get().lastFetchedAt > STALE_TIME,
  clear: () => {
    const timer = get().gcTimer
    if (timer) {
      clearTimeout(timer)
    }
    set({
      data: null,
      status: 'idle',
      error: null,
      lastFetchedAt: 0,
      gcTimer: null
    })
  },
  invalidate: () => set({ lastFetchedAt: 0 }),
  fetchBalance: async ({ force = false } = {}) => {
    const { lastFetchedAt, status } = get()
    if (!force && lastFetchedAt && Date.now() - lastFetchedAt <= STALE_TIME) {
      return get().data
    }
    if (status === 'loading') {
      return get().data
    }

    set({ status: 'loading', error: null })
    try {
      const data = await getBalance()
      const previousTimer = get().gcTimer
      if (previousTimer) {
        clearTimeout(previousTimer)
      }

      const gcTimer = setTimeout(() => {
        get().clear()
      }, GC_TIME)

      set({
        data,
        status: 'success',
        error: null,
        lastFetchedAt: Date.now(),
        gcTimer
      })
      return data
    } catch (error) {
      set({ status: 'error', error })
      throw error
    }
  }
}))

export default useBalanceStore

import { useAuth } from '@/contexts/AuthContext'
import useBalanceStore from '@/stores/server/balance'
import { useCallback, useEffect } from 'react'

export function useBalance() {
  const { authStatus } = useAuth()
  const data = useBalanceStore((state) => state.data)
  const error = useBalanceStore((state) => state.error)
  const fetchBalance = useBalanceStore((state) => state.fetchBalance)

  const refreshBalance = useCallback(
    async (force = false) => {
      if (!authStatus.is_logged_in) return null
      return fetchBalance({ force })
    },
    [authStatus.is_logged_in, fetchBalance]
  )

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  useEffect(() => {
    const onFocus = () => refreshBalance()
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [refreshBalance])

  return {
    balance: data?.balance || '0.00',
    error,
    refreshBalance
  }
}

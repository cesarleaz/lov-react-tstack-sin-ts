import { useCallback, useRef } from 'react'
export default function useDebounce(callback, delay) {
  const timeoutRef = useRef(undefined)
  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

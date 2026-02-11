import useCanvasStore from '@/stores/canvas'
import { createContext, useContext } from 'react'
export const CanvasContext = createContext(null)
export const CanvasProvider = ({ children }) => {
  return (
    <CanvasContext.Provider value={{ canvasStore: useCanvasStore }}>
      {children}
    </CanvasContext.Provider>
  )
}
export const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return context.canvasStore()
}

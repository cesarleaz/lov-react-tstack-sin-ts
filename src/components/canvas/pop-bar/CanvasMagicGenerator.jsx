import { Button } from '@/components/ui/button'
import { Hotkey } from '@/components/ui/hotkey'
import { useCanvas } from '@/contexts/canvas'
import { eventBus } from '@/lib/event'
import { useKeyPress } from 'ahooks'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { exportToCanvas } from '@excalidraw/excalidraw'
const CanvasMagicGenerator = ({ selectedImages, selectedElements }) => {
  const { t } = useTranslation()
  const { excalidrawAPI } = useCanvas()
  const handleMagicGenerate = async () => {
    if (!excalidrawAPI) return
    // 获取选中的元素
    const appState = excalidrawAPI.getAppState()
    const selectedIds = appState.selectedElementIds
    if (Object.keys(selectedIds).length === 0) {
      console.log('没有选中任何元素')
      return
    }
    const files = excalidrawAPI.getFiles()
    // 使用官方SDK导出canvas
    const canvas = await exportToCanvas({
      elements: selectedElements,
      appState: {
        ...appState,
        selectedElementIds: selectedIds
      },
      files,
      mimeType: 'image/png',
      maxWidthOrHeight: 2048,
      quality: 1
    })
    // 转base64
    const base64 = canvas.toDataURL('image/png', 0.8)
    // 发送魔法生成事件
    eventBus.emit('Canvas::MagicGenerate', {
      fileId: `magic-${Date.now()}`,
      base64: base64,
      width: canvas.width,
      height: canvas.height,
      timestamp: new Date().toISOString()
    })
    // 清除选中状态
    excalidrawAPI?.updateScene({
      appState: { selectedElementIds: {} }
    })
  }
  useKeyPress(['meta.b', 'ctrl.b'], handleMagicGenerate)
  return (
    <Button variant="ghost" size="sm" onClick={handleMagicGenerate}>
      {t('canvas:popbar.magicGenerate')} <Hotkey keys={['⌘', 'B']} />
    </Button>
  )
}
export default memo(CanvasMagicGenerator)

import useConfigsStore from '@/stores/configs'
import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import useModelsStore from '@/stores/server/models'
export const ConfigsContext = createContext(null)
export const ConfigsProvider = ({ children }) => {
  const configsStore = useConfigsStore()
  const {
    setTextModels,
    setTextModel,
    setSelectedTools,
    setAllTools,
    setShowLoginDialog
  } = configsStore
  // 存储上一次的 allTools 值，用于检测新添加的工具，并自动选中
  const previousAllToolsRef = useRef([])
  const modelList = useModelsStore((state) => state.data)
  const fetchModels = useModelsStore((state) => state.fetchModels)

  const refreshModels = useCallback(
    async (force = false) => fetchModels({ force }),
    [fetchModels]
  )

  useEffect(() => {
    refreshModels()

    const onFocus = () => refreshModels()
    const onOnline = () => refreshModels()

    window.addEventListener('focus', onFocus)
    window.addEventListener('online', onOnline)

    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('online', onOnline)
    }
  }, [refreshModels])
  useEffect(() => {
    if (!modelList) return
    const { llm: llmModels = [], tools: toolList = [] } = modelList
    setTextModels(llmModels || [])
    setAllTools(toolList || [])
    // 设置选择的文本模型
    const textModel = localStorage.getItem('text_model')
    if (
      textModel &&
      llmModels.find((m) => m.provider + ':' + m.model === textModel)
    ) {
      setTextModel(
        llmModels.find((m) => m.provider + ':' + m.model === textModel)
      )
    } else {
      setTextModel(llmModels.find((m) => m.type === 'text'))
    }
    // 设置选中的工具模型
    const disabledToolsJson = localStorage.getItem('disabled_tool_ids')
    let currentSelectedTools = []
    // by default, all tools are selected
    currentSelectedTools = toolList
    if (disabledToolsJson) {
      try {
        const disabledToolIds = JSON.parse(disabledToolsJson)
        // filter out disabled tools
        currentSelectedTools = toolList.filter(
          (t) => !disabledToolIds.includes(t.id)
        )
      } catch (error) {
        console.error(error)
      }
    }
    setSelectedTools(currentSelectedTools)
    // 如果文本模型或工具模型为空，则显示登录对话框
    if (llmModels.length === 0 || toolList.length === 0) {
      setShowLoginDialog(true)
    }
  }, [
    modelList,
    setSelectedTools,
    setTextModel,
    setTextModels,
    setAllTools,
    setShowLoginDialog
  ])
  return (
    <ConfigsContext.Provider
      value={{ configsStore: useConfigsStore, refreshModels }}
    >
      {children}
    </ConfigsContext.Provider>
  )
}
export const useConfigs = () => {
  const context = useContext(ConfigsContext)
  if (!context) {
    throw new Error('useConfigs must be used within a ConfigsProvider')
  }
  return context.configsStore()
}
export const useRefreshModels = () => {
  const context = useContext(ConfigsContext)
  if (!context) {
    throw new Error('useRefreshModels must be used within a ConfigsProvider')
  }
  return context.refreshModels
}

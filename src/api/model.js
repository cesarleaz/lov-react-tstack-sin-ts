export async function listModels() {
  const modelsResp = await fetch('/api/list_models')
    .then((res) => res.json())
    .catch((err) => {
      console.error(err)
      return []
    })
  const toolsResp = await fetch('/api/list_tools')
    .then((res) => res.json())
    .catch((err) => {
      console.error(err)
      return []
    })
  return {
    llm: modelsResp,
    tools: toolsResp
  }
}

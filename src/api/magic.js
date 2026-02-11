export const sendMagicGenerate = async (payload) => {
  const response = await fetch(`/api/magic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: payload.newMessages,
      canvas_id: payload.canvasId,
      session_id: payload.sessionId,
      system_prompt: payload.systemPrompt
    })
  })
  const data = await response.json()
  return data
}
export const cancelMagicGenerate = async (sessionId) => {
  const response = await fetch(`/api/magic/cancel/${sessionId}`, {
    method: 'POST'
  })
  return await response.json()
}

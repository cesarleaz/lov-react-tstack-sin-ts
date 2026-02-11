export async function listCanvases() {
  const response = await fetch('/api/canvas/list')
  return await response.json()
}
export async function createCanvas(data) {
  const response = await fetch('/api/canvas/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return await response.json()
}
export async function getCanvas(id) {
  const response = await fetch(`/api/canvas/${id}`)
  return await response.json()
}
export async function saveCanvas(id, payload) {
  const response = await fetch(`/api/canvas/${id}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return await response.json()
}
export async function renameCanvas(id, name) {
  const response = await fetch(`/api/canvas/${id}/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  return await response.json()
}
export async function deleteCanvas(id) {
  const response = await fetch(`/api/canvas/${id}/delete`, {
    method: 'DELETE'
  })
  return await response.json()
}

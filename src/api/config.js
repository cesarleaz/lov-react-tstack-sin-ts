export async function getConfigExists() {
  const response = await fetch('/api/config/exists')
  return await response.json()
}
export async function getConfig() {
  const response = await fetch('/api/config')
  return await response.json()
}
export async function updateConfig(config) {
  const response = await fetch('/api/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  })
  return await response.json()
}
// Update jaaz provider api_key after login
export async function updateJaazApiKey(token) {
  try {
    const config = await getConfig()
    if (config.jaaz) {
      config.jaaz.api_key = token
    }
    await updateConfig(config)
    console.log('Successfully updated jaaz provider api_key')
  } catch (error) {
    console.error('Error updating jaaz provider api_key:', error)
  }
}
// Clear jaaz provider api_key after logout
export async function clearJaazApiKey() {
  try {
    const config = await getConfig()
    if (config.jaaz) {
      config.jaaz.api_key = ''
      await updateConfig(config)
      console.log('Successfully cleared jaaz provider api_key')
    }
  } catch (error) {
    console.error('Error clearing jaaz provider api_key:', error)
  }
}

import { BASE_API_URL } from '../constants'
import { authenticatedFetch } from './auth'
export async function getBalance() {
  const response = await authenticatedFetch(
    `${BASE_API_URL}/api/billing/getBalance`
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch balance: ${response.status}`)
  }
  return await response.json()
}

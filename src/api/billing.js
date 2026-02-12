import { BASE_API_URL } from '../constants'
import { authenticatedFetch } from './auth'

export async function getBalance() {
  // TODO: manejo de billing del lado del frontend
  // const response = await authenticatedFetch(
  //   `${BASE_API_URL}/api/billing/getBalance`
  // )
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch balance: ${response.status}`)
  // }
  // return await response.json()

  // TODO: Resultado mock
  return {"balance":"3.00000000"}
}

import { BASE_API_URL } from '../constants'
import { authenticatedFetch } from './auth'
/**
 * 获取知识库列表
 * @param params 查询参数
 * @returns Promise<KnowledgeListResponse>
 */
export async function getKnowledgeList(params = {}) {
  const { pageSize = 10, pageNumber = 1, search } = params
  // 构建查询参数
  const queryParams = new URLSearchParams({
    pageSize: pageSize.toString(),
    pageNumber: pageNumber.toString()
  })
  if (search && search.trim()) {
    queryParams.append('search', search.trim())
  }
  try {
    const response = await authenticatedFetch(
      `${BASE_API_URL}/api/knowledge/list?${queryParams.toString()}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to get knowledge list:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get knowledge list'
    )
  }
}
/**
 * 获取单个知识库详情
 * @param id 知识库ID
 * @returns Promise<KnowledgeBase>
 */
export async function getKnowledgeById(id) {
  try {
    const response = await authenticatedFetch(
      `${BASE_API_URL}/api/knowledge/${id}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to get knowledge by id:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get knowledge base'
    )
  }
}
/**
 * 创建知识库
 * @param knowledgeData 知识库数据
 * @returns Promise<ApiResponse>
 */
export async function createKnowledge(knowledgeData) {
  try {
    const response = await authenticatedFetch(
      `${BASE_API_URL}/api/knowledge/create`,
      {
        method: 'POST',
        body: JSON.stringify(knowledgeData)
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to create knowledge:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create knowledge base'
    )
  }
}
/**
 * 更新知识库
 * @param id 知识库ID
 * @param knowledgeData 更新数据
 * @returns Promise<ApiResponse>
 */
export async function updateKnowledge(id, knowledgeData) {
  try {
    const response = await authenticatedFetch(
      `${BASE_API_URL}/api/knowledge/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(knowledgeData)
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to update knowledge:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to update knowledge base'
    )
  }
}
/**
 * 删除知识库
 * @param id 知识库ID
 * @returns Promise<ApiResponse>
 */
export async function deleteKnowledge(id) {
  try {
    const response = await authenticatedFetch(
      `${BASE_API_URL}/api/knowledge/${id}`,
      {
        method: 'DELETE'
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to delete knowledge:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to delete knowledge base'
    )
  }
}
/**
 * 将启用的知识库完整数据存储到本地设置
 * @param knowledgeData 完整的知识库数据数组
 * @returns Promise<ApiResponse>
 */
export async function saveEnabledKnowledgeDataToSettings(knowledgeData) {
  try {
    // 调用本地服务器API，不需要BASE_API_URL和认证
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        enabled_knowledge_data: knowledgeData
      })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to save knowledge data to settings:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to save knowledge data'
    )
  }
}

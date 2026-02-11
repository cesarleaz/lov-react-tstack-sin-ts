import { compressImageFile } from '@/utils/imageUtils'
export async function uploadImage(file) {
  // Compress image before upload
  const compressedFile = await compressImageFile(file)
  const formData = new FormData()
  formData.append('file', compressedFile)
  const response = await fetch('/api/upload_image', {
    method: 'POST',
    body: formData
  })
  return await response.json()
}

import { createClient } from '@/src/lib/supabase/client'

export async function uploadImageToSupabase(
  file: File, 
  bucket: 'avatars' | 'certificates', 
  folderPath: string
) {
  const supabase = createClient()

  // Tạo tên file ngẫu nhiên để tránh trùng tên (ví dụ: user_123/1718000000.png)
  const fileExt = file.name.split('.').pop()
  const fileName = `${folderPath}/${Date.now()}.${fileExt}`

  // 1. Upload file lên Storage Bucket
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    throw new Error(`Lỗi tải ảnh lên Supabase: ${error.message}`)
  }

  // 2. Lấy đường dẫn URL công khai của ảnh
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}
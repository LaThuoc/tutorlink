import { createClient } from '@/src/lib/supabase/client'

export async function uploadCertificateImage(
  file: File, 
  userId: string
): Promise<string | null> {
  try{
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // 1. Upload file lên Storage Bucket
    const { error: uploadError } = await supabase.storage
      .from('cerifications')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Lỗi khi upload ảnh chứng chỉ:', uploadError.message)
      return null
    }

    // 2. Lấy đường dẫn URL công khai của ảnh
    const { data} = supabase.storage
      .from('cerifications')
      .getPublicUrl(filePath)

    return data.publicUrl
  }catch(err){
    console.error('Lỗi hệ thống khi tải ảnh:', err)
    return null
  }
}
'use server';

import { createClient } from '@/src/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function changePasswordAction(formData: {
  currentPassword: string;
  newPassword: string;
}) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user || !user.email) {
      return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
    }

    const { currentPassword, newPassword } = formData;

    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Vui lòng nhập đầy đủ thông tin.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInErr) {
      return { success: false, error: 'Mật khẩu hiện tại không chính xác.' };
    }

    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      console.error('[changePasswordAction] Error:', updateErr);
      return { success: false, error: updateErr.message };
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi đổi mật khẩu.';
    return { success: false, error: msg };
  }
}
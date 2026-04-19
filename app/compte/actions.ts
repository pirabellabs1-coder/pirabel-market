'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await sb
    .from('profiles')
    .update({
      first_name: formData.get('first_name')?.toString() || null,
      last_name: formData.get('last_name')?.toString() || null,
      phone: formData.get('phone')?.toString() || null,
    })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/compte', 'page');
}

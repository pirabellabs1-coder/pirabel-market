import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { JournalForm } from '../_form';

export const dynamic = 'force-dynamic';

export default async function EditJournalPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createAdminClient();
  const { data: post } = await sb.from('journal_posts').select('*').eq('id', id).maybeSingle();
  if (!post) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{post.title_fr}</h1>
        <p className="mute mono" style={{ fontSize: 12 }}>/journal/{post.slug}</p>
      </div>
      <JournalForm post={post}/>
    </div>
  );
}

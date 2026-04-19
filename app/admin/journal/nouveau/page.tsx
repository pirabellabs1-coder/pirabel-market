import { JournalForm } from '../_form';

export const dynamic = 'force-dynamic';

export default function NewJournalPostPage() {
  return (
    <div>
      <div className="admin-page-head">
        <h1>Nouvel article</h1>
        <p className="mute">Rédige en Markdown — les ** **gras**, *italiques*, titres #, listes et images fonctionnent.</p>
      </div>
      <JournalForm/>
    </div>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import { SimplePage } from '@/components/simple-page';
import { Icon } from '@/components/icons';
import { useStore } from '@/components/store-provider';

export default function ContactPage() {
  const { lang } = useStore();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <SimplePage title={lang === 'fr' ? 'Nous écrire' : 'Write to us'} eyebrow={lang === 'fr' ? 'Contact' : 'Contact'}>
      <div className="grid-form" style={{ gap: 'clamp(32px, 6vw, 64px)' }}>
        <div>
          <p className="mute" style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            {lang === 'fr'
              ? 'Une question, une demande particulière ? Notre équipe vous répond sous 2h en jours ouvrés.'
              : 'A question or special request? Our team responds within 2h on weekdays.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div><div className="caps mute mb-2">WhatsApp</div><div>+229 01 97 12 34 56</div></div>
            <div><div className="caps mute mb-2">Email</div><div>contact@pirabel.bj</div></div>
            <div><div className="caps mute mb-2">{lang === 'fr' ? 'Adresse' : 'Address'}</div><div>Haie Vive, Cotonou · Bénin</div></div>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: 60, border: '1px solid var(--line)' }}>
              <Icon.Check s={32}/>
              <p className="serif mt-4" style={{ fontSize: 20 }}>{lang === 'fr' ? 'Message envoyé.' : 'Message sent.'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="field"><label>{lang === 'fr' ? 'Nom' : 'Name'}</label><input className="input" required/></div>
              <div className="field"><label>Email</label><input className="input" type="email" required/></div>
              <div className="field"><label>Message</label><textarea className="textarea" rows={5} required/></div>
              <button className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start' }} type="submit">
                {lang === 'fr' ? 'Envoyer' : 'Send'}
              </button>
            </div>
          )}
        </form>
      </div>
    </SimplePage>
  );
}

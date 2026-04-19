'use client';

import { useEffect, useState } from 'react';
import { Icon } from './icons';

type Popup = {
  id: string;
  title: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image: string | null;
  position: 'center' | 'bottom' | 'top' | string;
  trigger_type: 'delay' | 'scroll' | 'exit' | string;
  trigger_value: number;
  show_once: boolean;
};

const STORAGE_PREFIX = 'pb_popup_seen_';

export function PopupHost({ popups }: { popups: Popup[] }) {
  const [active, setActive] = useState<Popup | null>(null);

  useEffect(() => {
    if (!popups?.length) return;
    const candidates = popups.filter(p => {
      if (!p.show_once) return true;
      try { return !localStorage.getItem(STORAGE_PREFIX + p.id); } catch { return true; }
    });
    if (!candidates.length) return;

    const p = candidates[0];
    let fired = false;
    const show = () => {
      if (fired) return;
      fired = true;
      setActive(p);
      try { if (p.show_once) localStorage.setItem(STORAGE_PREFIX + p.id, '1'); } catch {}
    };

    let scrollHandler: (() => void) | null = null;
    let exitHandler: ((e: MouseEvent) => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (p.trigger_type === 'delay') {
      timer = setTimeout(show, Math.max(0, p.trigger_value) * 1000);
    } else if (p.trigger_type === 'scroll') {
      scrollHandler = () => {
        const pct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        if (pct >= p.trigger_value) show();
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
    } else if (p.trigger_type === 'exit') {
      exitHandler = (e) => { if (e.clientY < 10) show(); };
      document.addEventListener('mouseout', exitHandler);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
      if (exitHandler) document.removeEventListener('mouseout', exitHandler);
    };
  }, [popups]);

  if (!active) return null;

  const close = () => setActive(null);

  return (
    <div className="popup-overlay" onClick={close} role="dialog" aria-modal="true" aria-label={active.title}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={close} aria-label="Fermer"><Icon.X s={18}/></button>
        {active.image && <img src={active.image} alt="" className="popup-img"/>}
        <div className="popup-content">
          <h3 className="serif" style={{ fontSize: 24, fontWeight: 400, margin: '0 0 12px', lineHeight: 1.2 }}>{active.title}</h3>
          {active.body && <div className="mute" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: active.body }}/>}
          {active.cta_label && active.cta_url && (
            <a className="btn btn-primary btn-block" href={active.cta_url} onClick={close}>{active.cta_label}</a>
          )}
        </div>
      </div>
    </div>
  );
}

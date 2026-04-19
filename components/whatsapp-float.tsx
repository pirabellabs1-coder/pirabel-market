import { Icon } from './icons';
import { BRAND } from '@/lib/brand';

export function WhatsAppFloat() {
  return (
    <a href={BRAND.whatsappUrl} target="_blank" rel="noopener" className="whats-float" aria-label="WhatsApp">
      <Icon.Whats/>
    </a>
  );
}

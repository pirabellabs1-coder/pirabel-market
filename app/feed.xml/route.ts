import { createAdminClient } from '@/lib/supabase/admin';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';
const BRAND_NAME = 'Pirabel';

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));
}

export const revalidate = 3600;

export async function GET() {
  const sb = createAdminClient();
  const { data: products } = await sb
    .from('products')
    .select('id, name_fr, desc_fr, price, img, img2, category, collection, stock, published')
    .eq('published', true);

  const items = (products ?? []).map(p => {
    const avail = p.stock === 0 ? 'out_of_stock' : 'in_stock';
    const link = `${SITE}/produit/${p.id}`;
    const imgs = [p.img, p.img2].filter(Boolean);
    const description = (p.desc_fr || p.name_fr).slice(0, 5000);
    return `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name_fr)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imgs[0] ?? '')}</g:image_link>
      ${imgs.slice(1).map(u => `<g:additional_image_link>${escapeXml(u!)}</g:additional_image_link>`).join('')}
      <g:availability>${avail}</g:availability>
      <g:price>${p.price} XOF</g:price>
      <g:brand>${escapeXml(BRAND_NAME)}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(p.collection || '')}</g:product_type>
      <g:google_product_category>${escapeXml(p.category || 'Apparel &amp; Accessories')}</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>BJ</g:country>
        <g:service>Standard</g:service>
        <g:price>2500 XOF</g:price>
      </g:shipping>
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Pirabel — Maison de Cotonou</title>
    <link>${SITE}</link>
    <description>Sélection de mode et accessoires, Pirabel Cotonou</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}

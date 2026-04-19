import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

/** Strip markdown for plain-text excerpts */
export function stripMarkdown(md: string, maxLen = 200): string {
  const plain = md
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen - 1) + '…' : plain;
}

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  uploadEndpoint?: string;
};

export function RichEditor({ value, onChange, placeholder, minHeight = 260, uploadEndpoint = '/api/upload' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({ allowBase64: false, HTMLAttributes: { style: 'max-width:100%;height:auto;margin:1em 0;' } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder: placeholder || 'Écris ici…' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep editor in sync when parent resets value (e.g., on form save)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value && !editor.isFocused) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL du lien (vide pour retirer)', prev ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertImageUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL de l\'image');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const uploadAndInsert = useCallback(async (file: File) => {
    if (!editor) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(uploadEndpoint, { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Upload échoué');
      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch (e) {
      alert((e as Error).message);
    }
  }, [editor, uploadEndpoint]);

  if (!editor) return <div className="input" style={{ minHeight, padding: 12 }}/>;

  const Btn = ({ on, active, children, title }: { on: () => void; active?: boolean; children: React.ReactNode; title?: string }) => (
    <button type="button" onClick={on} title={title}
      style={{
        padding: '6px 10px', fontSize: 13, fontWeight: 500,
        border: '1px solid var(--line)', background: active ? 'var(--ink)' : 'var(--ivory)',
        color: active ? 'var(--ivory)' : 'var(--ink)', cursor: 'pointer',
      }}>{children}</button>
  );

  return (
    <div className="rich-editor" style={{ border: '1px solid var(--line)', background: 'var(--white)' }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, padding: 8,
        borderBottom: '1px solid var(--line)', background: 'var(--ivory-2)',
      }}>
        <Btn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras (Ctrl+B)"><b>B</b></Btn>
        <Btn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique"><i>I</i></Btn>
        <Btn on={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné"><u>U</u></Btn>
        <Btn on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Barré"><s>S</s></Btn>
        <span style={{ width: 1, background: 'var(--line)', margin: '0 4px' }}/>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Titre 2">H2</Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Titre 3">H3</Btn>
        <Btn on={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraphe">P</Btn>
        <span style={{ width: 1, background: 'var(--line)', margin: '0 4px' }}/>
        <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste">•</Btn>
        <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">1.</Btn>
        <Btn on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citation">❝</Btn>
        <Btn on={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur">—</Btn>
        <span style={{ width: 1, background: 'var(--line)', margin: '0 4px' }}/>
        <Btn on={setLink} active={editor.isActive('link')} title="Lien">🔗</Btn>
        <Btn on={() => fileRef.current?.click()} title="Téléverser une image">📁 Image</Btn>
        <Btn on={insertImageUrl} title="Image via URL">🖼 URL</Btn>
        <span style={{ width: 1, background: 'var(--line)', margin: '0 4px' }}/>
        <Btn on={() => editor.chain().focus().undo().run()} title="Annuler">↶</Btn>
        <Btn on={() => editor.chain().focus().redo().run()} title="Rétablir">↷</Btn>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadAndInsert(f);
            if (fileRef.current) fileRef.current.value = '';
          }}
        />
      </div>

      <EditorContent
        editor={editor}
        className="rich-editor-body"
        style={{ padding: 16, minHeight, fontSize: 15, lineHeight: 1.7 }}
      />
    </div>
  );
}

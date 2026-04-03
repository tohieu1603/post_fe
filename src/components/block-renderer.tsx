'use client';

import { useState } from 'react';
import type { ContentBlock } from '@/lib/types';

interface BlockRendererProps {
  blocks: ContentBlock[];
  className?: string;
}

export function BlockRenderer({ blocks, className = '' }: BlockRendererProps) {
  return (
    <div className={`max-w-none ${className}`}>
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} />
      ))}
    </div>
  );
}

// Normalize block to handle both ContentBlock (flat) and ContentSection (nested) formats
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(block: any): ContentBlock {
  return {
    ...block,
    // paragraph/quote/html: content → text
    text: block.text || block.content || '',
    // code: content → code
    code: block.code || block.content || '',
    // image: nested → flat
    url: block.url || block.image?.url || '',
    alt: block.alt || block.image?.alt || '',
    caption: block.caption || block.image?.caption || '',
    // list: nested → flat
    items: block.items || block.list?.items || [],
    style: block.style || block.list?.type || 'unordered',
    // table: nested → flat
    headers: block.headers || block.table?.headers || [],
    rows: block.rows || block.table?.rows || [],
    // faq: array → single (render first, or use faqs)
    question: block.question || block.faqs?.[0]?.question || '',
    answer: block.answer || block.faqs?.[0]?.answer || '',
    faqs: block.faqs || (block.question ? [{ question: block.question, answer: block.answer }] : []),
    // review: nested → flat
    review: block.review || null,
  };
}

function BlockItem({ block: rawBlock }: { block: ContentBlock }) {
  const block = normalize(rawBlock);

  switch (block.type) {
    case 'heading': {
      const level = Math.min(Math.max(block.level ?? 2, 1), 6);
      const Tag = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const sizeMap: Record<number, string> = {
        1: 'text-3xl font-black text-primary mt-12 mb-4 tracking-tight scroll-mt-24',
        2: 'text-2xl font-black text-primary mt-12 mb-4 tracking-tight scroll-mt-24',
        3: 'text-xl font-black text-primary mt-8 mb-3 tracking-tight scroll-mt-24',
        4: 'text-lg font-bold text-primary mt-6 mb-2 scroll-mt-24',
        5: 'text-base font-bold text-primary mt-4 mb-2 scroll-mt-24',
        6: 'text-sm font-bold text-primary uppercase tracking-wide mt-4 mb-2 scroll-mt-24',
      };
      return (
        <Tag id={block.anchor} className={sizeMap[level]}>
          {block.text}
        </Tag>
      );
    }

    case 'paragraph':
      return (
        <p
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.text ?? '' }}
        />
      );

    case 'image':
      return (
        <figure className="my-6">
          {block.url && (
            <img
              src={block.url}
              alt={block.alt ?? ''}
              className="w-full rounded-xl object-cover"
            />
          )}
          {block.caption && (
            <figcaption className="text-center text-sm text-on-surface-variant mt-2 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'list':
      if (block.style === 'ordered') {
        return (
          <ol className="space-y-4 my-8 list-decimal list-outside pl-6">
            {block.items?.map((item: string, i: number) => (
              <li key={i} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="space-y-4 my-8">
          {block.items?.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'code':
      return <CodeBlock block={block} />;

    case 'quote':
      return (
        <blockquote className="border-l-4 border-primary bg-primary/5 p-6 rounded-r-xl italic my-8">
          {block.text}
        </blockquote>
      );

    case 'divider':
      return <hr className="my-8 border-outline-variant/30" />;

    case 'table':
      return (
        <div className="overflow-hidden rounded-xl border border-outline-variant my-8">
          <table className="w-full text-sm text-left">
            {block.headers && block.headers.length > 0 && (
              <thead className="bg-surface-container-high text-on-surface font-bold">
                <tr>
                  {block.headers.map((h: string, i: number) => (
                    <th key={i} className="px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-outline-variant/20">
              {block.rows?.map((row: string[], ri: number) => (
                <tr
                  key={ri}
                  className={`hover:bg-primary/5 transition-colors ${
                    ri % 2 !== 0 ? 'bg-surface-container-low' : ''
                  }`}
                >
                  {row.map((cell: string, ci: number) => (
                    <td
                      key={ci}
                      className={`px-6 py-4 ${ci === 0 ? 'font-medium' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'faq':
      return (
        <>
          {block.faqs?.map((faq: { question: string; answer: string }, i: number) => (
            <FaqBlock key={i} block={{ ...block, question: faq.question, answer: faq.answer }} />
          ))}
        </>
      );

    case 'review':
      return (
        <div className="bg-surface-container-low rounded-xl p-6 my-8 border border-outline-variant/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-bold text-lg">{block.review?.provider}</span>
            <span className="text-amber-500 font-bold">{block.review?.rating}/5</span>
          </div>
          {block.review?.summary && <p className="text-sm mb-4">{block.review.summary}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-bold text-emerald-600 mb-2">Ưu điểm</h5>
              <ul className="space-y-1">{block.review?.pros?.map((p: string, i: number) => <li key={i} className="text-sm flex gap-2"><span className="text-emerald-500">+</span>{p}</li>)}</ul>
            </div>
            <div>
              <h5 className="font-bold text-red-500 mb-2">Nhược điểm</h5>
              <ul className="space-y-1">{block.review?.cons?.map((c: string, i: number) => <li key={i} className="text-sm flex gap-2"><span className="text-red-500">-</span>{c}</li>)}</ul>
            </div>
          </div>
        </div>
      );

    case 'html':
      return <div className="my-6" dangerouslySetInnerHTML={{ __html: block.text ?? '' }} />;

    case 'media-text':
      return (
        <div
          className={`flex flex-col md:flex-row gap-5 my-6 ${
            block.mediaPosition === 'right' ? 'md:flex-row-reverse' : ''
          }`}
        >
          {block.imageUrl && (
            <div
              className="shrink-0 rounded-xl overflow-hidden bg-surface-container"
              style={{ width: block.mediaWidth ? `${block.mediaWidth}%` : '40%' }}
            >
              <img
                src={block.imageUrl}
                alt={block.imageAlt ?? ''}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            {block.title && (
              <h4 className="text-lg font-bold text-on-background mb-2">{block.title}</h4>
            )}
            {block.text && (
              <p
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: block.text }}
              />
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CodeBlock({ block }: { block: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.code ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-6 rounded-lg my-8 font-mono text-sm overflow-x-auto">
      <div className="flex justify-between mb-2 text-slate-400">
        <span>{block.language ?? 'code'}</span>
        <button
          onClick={handleCopy}
          aria-label="Sao chép code"
          className="hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined scale-75 cursor-pointer">
            {copied ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
      <pre><code>{block.code}</code></pre>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FaqBlock({ block }: { block: any }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="group bg-surface-container-lowest p-4 rounded-xl my-4"
      open={open}
      onClick={(e) => { e.preventDefault(); setOpen(!open); }}
    >
      <summary className="flex justify-between items-center cursor-pointer font-bold text-primary list-none">
        {block.question}
        <span className="material-symbols-outlined transition-transform group-open:rotate-180">
          expand_more
        </span>
      </summary>
      {open && (
        <p className="mt-3 text-sm text-on-surface-variant">{block.answer}</p>
      )}
    </details>
  );
}

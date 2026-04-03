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

function BlockItem({ block }: { block: ContentBlock }) {
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
            {block.items?.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="space-y-4 my-8">
          {block.items?.map((item, i) => (
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
            {block.headers && (
              <thead className="bg-surface-container-high text-on-surface font-bold">
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i} className="px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-outline-variant/20">
              {block.rows?.map((row, ri) => (
                <tr
                  key={ri}
                  className={`hover:bg-primary/5 transition-colors ${
                    ri % 2 !== 0 ? 'bg-surface-container-low' : ''
                  }`}
                >
                  {row.map((cell, ci) => (
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
      return <FaqBlock block={block} />;

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

function CodeBlock({ block }: { block: ContentBlock }) {
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

function FaqBlock({ block }: { block: ContentBlock }) {
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

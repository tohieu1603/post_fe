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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const block = normalize(rawBlock) as any;

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

    case 'image': {
      const imgUrl = block.url || block.image?.url || '';
      const imgAlt = block.alt || block.image?.alt || '';
      const imgCaption = block.caption || block.image?.caption || '';
      if (!imgUrl) return null;
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={imgAlt}
            className="w-full rounded-xl object-cover max-h-[500px]"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {imgCaption && (
            <figcaption className="text-center text-sm text-on-surface-variant mt-2 italic">
              {imgCaption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'list':
      if (block.style === 'ordered') {
        return (
          <ol className="space-y-4 my-8 list-decimal list-outside pl-6">
            {block.items?.map((item: string, i: number) => (
              <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ol>
        );
      }
      return (
        <ul className="space-y-4 my-8">
          {block.items?.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      );

    case 'code':
      return <CodeBlock block={block} />;

    case 'quote':
      return (
        <blockquote className="border-l-4 border-primary bg-primary/5 p-6 rounded-r-xl italic my-8" dangerouslySetInnerHTML={{ __html: block.text ?? '' }} />
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
          {(block.faqs as { question: string; answer: string }[])?.map((faq, i) => (
            <FaqBlock key={i} block={{ id: block.id + '-' + i, question: faq.question, answer: faq.answer }} />
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
      return <div className="my-6" dangerouslySetInnerHTML={{ __html: block.text ?? block.content ?? '' }} />;

    case 'link': {
      const lnk = block.link || block;
      const linkStyle = lnk.style === 'button'
        ? 'inline-block bg-primary text-on-primary px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity my-4'
        : lnk.style === 'card'
        ? 'block bg-surface-container-low border border-outline-variant rounded-xl p-4 hover:shadow-md transition-shadow my-4'
        : 'text-primary underline hover:no-underline';
      return (
        <a href={lnk.url} target={lnk.target || '_blank'} rel={lnk.rel || 'noopener noreferrer'} className={linkStyle}>
          {lnk.text || lnk.url}
        </a>
      );
    }

    case 'embed': {
      const emb = block.embed || block;
      if (emb.html) return <div className="my-8" dangerouslySetInnerHTML={{ __html: emb.html }} />;
      const isYt = emb.url?.includes('youtube') || emb.url?.includes('youtu.be');
      const ytId = emb.url?.match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1];
      if (isYt && ytId) {
        return (
          <figure className="my-8">
            <div className="relative pb-[56.25%] rounded-xl overflow-hidden bg-black">
              <iframe src={`https://www.youtube.com/embed/${ytId}`} className="absolute inset-0 w-full h-full" allowFullScreen loading="lazy" />
            </div>
            {emb.caption && <figcaption className="text-center text-sm text-on-surface-variant mt-2 italic">{emb.caption}</figcaption>}
          </figure>
        );
      }
      const isTweet = emb.url?.includes('twitter.com') || emb.url?.includes('x.com');
      if (isTweet) {
        return (
          <div className="my-8 flex justify-center">
            <blockquote className="twitter-tweet"><a href={emb.url}>{emb.url}</a></blockquote>
          </div>
        );
      }
      return (
        <figure className="my-8">
          <div className="relative pb-[56.25%] rounded-xl overflow-hidden">
            <iframe src={emb.url} className="absolute inset-0 w-full h-full border-0" allowFullScreen loading="lazy" />
          </div>
          {emb.caption && <figcaption className="text-center text-sm text-on-surface-variant mt-2 italic">{emb.caption}</figcaption>}
        </figure>
      );
    }

    case 'video': {
      const vid = block.video || block;
      return (
        <figure className="my-8">
          <video
            src={vid.url}
            poster={vid.poster}
            controls
            className="w-full rounded-xl"
            preload="metadata"
            {...(vid.autoplay ? { autoPlay: true, muted: true } : {})}
          />
          {vid.caption && <figcaption className="text-center text-sm text-on-surface-variant mt-2 italic">{vid.caption}</figcaption>}
        </figure>
      );
    }

    case 'audio': {
      const aud = block.audio || block;
      return (
        <figure className="my-6 bg-surface-container-low rounded-xl p-4">
          {aud.title && <p className="font-bold mb-2">{aud.title}</p>}
          <audio src={aud.url} controls className="w-full" preload="metadata" />
          {aud.caption && <p className="text-sm text-on-surface-variant mt-2">{aud.caption}</p>}
        </figure>
      );
    }

    case 'callout': {
      const co = block.callout || block;
      const coType = co.type || co.calloutType || 'info';
      const coStyles: Record<string, string> = {
        info: 'bg-blue-50 border-blue-400 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-500',
        warning: 'bg-amber-50 border-amber-400 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-500',
        error: 'bg-red-50 border-red-400 text-red-900 dark:bg-red-950/30 dark:text-red-200 dark:border-red-500',
        success: 'bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-500',
        tip: 'bg-purple-50 border-purple-400 text-purple-900 dark:bg-purple-950/30 dark:text-purple-200 dark:border-purple-500',
        note: 'bg-gray-50 border-gray-400 text-gray-900 dark:bg-gray-800/30 dark:text-gray-200 dark:border-gray-500',
      };
      const icons: Record<string, string> = { info: 'info', warning: 'warning', error: 'error', success: 'check_circle', tip: 'lightbulb', note: 'edit_note' };
      return (
        <div className={`border-l-4 rounded-r-xl p-5 my-8 ${coStyles[coType] || coStyles.info}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-lg">{icons[coType] || 'info'}</span>
            {co.title && <span className="font-bold">{co.title}</span>}
          </div>
          <div dangerouslySetInnerHTML={{ __html: co.content || '' }} />
        </div>
      );
    }

    case 'button': {
      const btn = block.button || block;
      const btnStyles: Record<string, string> = {
        primary: 'bg-primary text-on-primary hover:opacity-90',
        secondary: 'bg-secondary text-on-secondary hover:opacity-90',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10',
        ghost: 'text-primary hover:bg-primary/10',
      };
      const btnSizes: Record<string, string> = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3', lg: 'px-8 py-4 text-lg' };
      return (
        <div className="my-6">
          <a
            href={btn.url}
            target={btn.target || '_blank'}
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-full font-bold transition-all ${btnStyles[btn.style || 'primary']} ${btnSizes[btn.size || 'md']}`}
          >
            {btn.icon && <span className="material-symbols-outlined">{btn.icon}</span>}
            {btn.text}
          </a>
        </div>
      );
    }

    case 'accordion': {
      const acc = block.accordion || block;
      const items = acc.items || [];
      return (
        <div className="my-8 space-y-2">
          {items.map((item: { title: string; content: string }, i: number) => (
            <AccordionItem key={i} title={item.title} content={item.content} />
          ))}
        </div>
      );
    }

    case 'file': {
      const fl = block.file || block;
      const sizeStr = fl.size ? (fl.size > 1048576 ? `${(fl.size / 1048576).toFixed(1)} MB` : `${(fl.size / 1024).toFixed(0)} KB`) : '';
      return (
        <a href={fl.url} download className="flex items-center gap-3 bg-surface-container-low border border-outline-variant rounded-xl p-4 my-6 hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-2xl text-primary">download</span>
          <div>
            <p className="font-bold">{fl.filename}</p>
            {sizeStr && <p className="text-sm text-on-surface-variant">{sizeStr}</p>}
          </div>
        </a>
      );
    }

    case 'gallery': {
      const gal = block.gallery || block;
      const imgs = gal.images || [];
      const cols = gal.columns || 3;
      return (
        <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-3 my-8`}>
          {imgs.map((img: { url: string; alt?: string; caption?: string }, i: number) => (
            <figure key={i} className="rounded-xl overflow-hidden bg-surface-container">
              <img src={img.url} alt={img.alt || ''} className="w-full h-48 object-cover" loading="lazy" />
              {img.caption && <figcaption className="text-xs text-center p-2 text-on-surface-variant">{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );
    }

    case 'map': {
      const mp = block.map || block;
      const mapUrl = mp.embedUrl || `https://maps.google.com/maps?q=${mp.lat},${mp.lng}&z=${mp.zoom || 15}&output=embed`;
      return (
        <figure className="my-8">
          <div className="relative pb-[56.25%] rounded-xl overflow-hidden">
            <iframe src={mapUrl} className="absolute inset-0 w-full h-full border-0" loading="lazy" allowFullScreen />
          </div>
          {mp.caption && <figcaption className="text-center text-sm text-on-surface-variant mt-2">{mp.caption}</figcaption>}
        </figure>
      );
    }

    case 'social': {
      const soc = block.social || block;
      if (soc.html) return <div className="my-8 flex justify-center" dangerouslySetInnerHTML={{ __html: soc.html }} />;
      return (
        <div className="my-8 flex justify-center">
          <a href={soc.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            View on {soc.platform}
          </a>
        </div>
      );
    }

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

function AccordionItem({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="group bg-surface-container-lowest border border-outline-variant/30 rounded-xl"
      open={open}
      onClick={(e) => { e.preventDefault(); setOpen(!open); }}
    >
      <summary className="flex justify-between items-center cursor-pointer font-bold p-4 list-none">
        {title}
        <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
      </summary>
      {open && <div className="px-4 pb-4 text-sm text-on-surface-variant" dangerouslySetInnerHTML={{ __html: content }} />}
    </details>
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

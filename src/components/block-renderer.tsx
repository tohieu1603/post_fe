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
      {blocks.map((block) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = block as any;
        const { className: sc, inlineStyle: ss } = applyBlockStyle(raw.style);
        if (sc || Object.keys(ss).length > 0) {
          return (
            <div key={block.id} className={sc} style={ss}>
              <BlockItem block={block} />
            </div>
          );
        }
        return <BlockItem key={block.id} block={block} />;
      })}
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

function TabsRenderer({ tabs }: { tabs: any }) {
  const [active, setActive] = useState(0);
  const styleMap: Record<string, string> = {
    default: 'border-b-2 border-primary text-primary',
    pills: 'bg-primary text-on-primary rounded-lg',
    underline: 'border-b-2 border-primary text-primary',
  };
  const activeStyle = styleMap[tabs.style || 'default'];
  return (
    <div className="my-8">
      <div className="flex gap-1 border-b border-outline-variant/30 mb-4">
        {tabs.items?.map((tab: any, i: number) => (
          <button key={i} onClick={() => setActive(i)} className={`px-4 py-2.5 text-sm font-bold transition-colors ${i === active ? activeStyle : 'text-on-surface-variant hover:text-on-surface'}`}>
            {tab.icon && <span className="material-symbols-outlined text-sm mr-1.5 align-middle">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.items?.[active] && (
        <div className="text-on-surface leading-relaxed" dangerouslySetInnerHTML={{ __html: tabs.items[active].content }} />
      )}
    </div>
  );
}

/**
 * Apply BlockStyle from templates — backgroundColor, textColor, tailwindClasses, animation, etc.
 */
function applyBlockStyle(style: any): { className: string; inlineStyle: React.CSSProperties } {
  if (!style) return { className: '', inlineStyle: {} };
  const classes: string[] = [];
  const css: React.CSSProperties = {};

  // Tailwind classes from templates
  if (style.tailwindClasses) classes.push(style.tailwindClasses);
  if (style.className) classes.push(style.className);

  // Colors
  if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
  if (style.textColor) css.color = style.textColor;
  if (style.borderColor) { css.borderColor = style.borderColor; css.borderWidth = style.borderWidth || 1; css.borderStyle = (style.borderStyle as any) || 'solid'; }

  // Spacing
  if (style.marginTop) css.marginTop = style.marginTop;
  if (style.marginBottom) css.marginBottom = style.marginBottom;
  if (style.paddingTop) css.paddingTop = style.paddingTop;
  if (style.paddingBottom) css.paddingBottom = style.paddingBottom;
  if (style.paddingLeft) css.paddingLeft = style.paddingLeft;
  if (style.paddingRight) css.paddingRight = style.paddingRight;

  // Border
  if (style.borderRadius) css.borderRadius = style.borderRadius;

  // Shadow
  const shadowMap: Record<string, string> = { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 15px rgba(0,0,0,0.1)', xl: '0 20px 25px rgba(0,0,0,0.1)' };
  if (style.boxShadow && style.boxShadow !== 'none') css.boxShadow = shadowMap[style.boxShadow] || '';

  // Size
  if (style.maxWidth) css.maxWidth = style.maxWidth;
  if (style.minHeight) css.minHeight = style.minHeight;

  // Text
  const fontSizeMap: Record<string, string> = { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem' };
  if (style.fontSize && fontSizeMap[style.fontSize]) css.fontSize = fontSizeMap[style.fontSize];
  const fontWeightMap: Record<string, number> = { normal: 400, medium: 500, semibold: 600, bold: 700 };
  if (style.fontWeight) css.fontWeight = fontWeightMap[style.fontWeight];
  const textAlignMap: Record<string, string> = { left: 'left', center: 'center', right: 'right', justify: 'justify' };
  if (style.textAlign) css.textAlign = textAlignMap[style.textAlign as string] as any;

  // Animation
  const animMap: Record<string, string> = { 'fade-in': 'animate-fade-in', 'slide-up': 'animate-slide-up', 'slide-left': 'animate-slide-left', 'zoom-in': 'animate-zoom-in', 'bounce': 'animate-bounce' };
  if (style.animation && style.animation !== 'none' && animMap[style.animation]) classes.push(animMap[style.animation]);

  // Visibility
  if (style.hideOnMobile) classes.push('hidden md:block');
  if (style.hideOnDesktop) classes.push('md:hidden');

  // CSS override
  if (style.cssOverride) {
    const pairs = style.cssOverride.split(';').filter(Boolean);
    pairs.forEach((pair: string) => {
      const [key, val] = pair.split(':').map((s: string) => s.trim());
      if (key && val) (css as any)[key.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())] = val;
    });
  }

  // Background from style.background (template format)
  if (style.background) {
    if (style.background.type === 'gradient' && style.background.gradient) css.background = style.background.gradient;
    if (style.background.type === 'solid' && style.background.color) css.backgroundColor = style.background.color;
  }

  // Typography from style.typography
  if (style.typography) {
    if (style.typography.color) css.color = style.typography.color;
    if (style.typography.textAlign) css.textAlign = style.typography.textAlign as any;
    if (style.typography.textShadow) css.textShadow = style.typography.textShadow;
    if (style.typography.fontFamily) css.fontFamily = style.typography.fontFamily;
  }

  return { className: classes.join(' '), inlineStyle: css };
}

function BlockItem({ block: rawBlock }: { block: ContentBlock }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const block = normalize(rawBlock) as any;
  const { className: styleClass, inlineStyle } = applyBlockStyle(block.style);

  // Wrap block output with style if present
  const wrap = (el: React.ReactNode) => {
    if (!styleClass && Object.keys(inlineStyle).length === 0) return el;
    return <div className={styleClass} style={inlineStyle}>{el}</div>;
  };

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

    case 'stats': {
      const st = block.stats || { items: [] };
      return (
        <div className={`grid gap-4 my-8 ${st.layout === 'grid' ? `grid-cols-2 md:grid-cols-${st.columns || 4}` : 'grid-cols-2 md:grid-cols-4'}`}>
          {st.items?.map((item: any, i: number) => (
            <div key={i} className="bg-surface-container-low p-6 rounded-xl text-center border border-outline-variant/20">
              {item.icon && <span className="material-symbols-outlined text-2xl mb-2" style={{ color: item.color || '#10b981' }}>{item.icon}</span>}
              <div className="text-3xl font-black" style={{ color: item.color || '#10b981' }}>{item.value}</div>
              <div className="text-sm text-on-surface-variant mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case 'progress': {
      const pg = block.progressBar || { items: [] };
      return (
        <div className="space-y-4 my-8">
          {pg.items?.map((item: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-bold text-on-surface">{item.label}</span>
                {pg.showValue !== false && <span className="text-sm font-bold" style={{ color: item.color || '#10b981' }}>{item.value}%</span>}
              </div>
              <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color || '#10b981' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'comparison': {
      const cp = block.comparison || { columns: [], features: [] };
      const colors = ['text-emerald-600', 'text-blue-600', 'text-purple-600'];
      const bgColors = ['bg-emerald-600/5', 'bg-blue-600/5', 'bg-purple-600/5'];
      const borderColors = ['border-emerald-600', 'border-blue-600', 'border-purple-600'];
      return (
        <div className="overflow-x-auto my-8">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-on-surface-variant font-bold text-sm">Feature</th>
                {cp.columns?.map((col: any, i: number) => (
                  <th key={i} className={`p-4 text-center font-bold text-sm ${colors[i] || colors[0]} ${bgColors[i] || bgColors[0]} ${col.highlighted ? `border-t-4 ${borderColors[i] || borderColors[0]}` : ''}`}>
                    {col.title}
                    {col.price && <div className="text-xs font-normal text-on-surface-variant mt-1">{col.price}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cp.features?.map((feat: string, fi: number) => (
                <tr key={fi} className={fi % 2 === 0 ? 'bg-surface-container-lowest' : ''}>
                  <td className="p-4 text-sm font-medium text-on-surface">{feat}</td>
                  {cp.columns?.map((col: any, ci: number) => {
                    const val = col.features?.[feat] || '—';
                    const isCheck = val.includes('✅');
                    const isCross = val.includes('❌');
                    return (
                      <td key={ci} className={`p-4 text-center text-sm font-bold ${colors[ci] || colors[0]}`}>
                        {isCheck ? <span className="material-symbols-outlined text-emerald-500" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span> :
                         isCross ? <span className="material-symbols-outlined text-red-500">cancel</span> :
                         <span dangerouslySetInnerHTML={{__html: val}} />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'timeline': {
      const tl = block.timeline || { items: [] };
      return (
        <div className="relative my-8 pl-8 border-l-2 border-primary/30">
          {tl.items?.map((item: any, i: number) => (
            <div key={i} className="relative mb-8 last:mb-0">
              <div className="absolute -left-[25px] w-4 h-4 rounded-full border-2 border-primary bg-background" />
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1" style={{ color: item.color }}>{item.date}</div>
              <div className="text-base font-bold text-on-background mb-1">{item.title}</div>
              <div className="text-sm text-on-surface-variant" dangerouslySetInnerHTML={{__html: item.content}} />
            </div>
          ))}
        </div>
      );
    }

    case 'steps': {
      const sp = block.steps || { items: [] };
      return (
        <div className="space-y-6 my-8">
          {sp.items?.map((item: any, i: number) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-black text-sm">{i + 1}</div>
              <div className="flex-1 pt-1">
                <div className="font-bold text-on-background mb-1">{item.title}</div>
                <div className="text-sm text-on-surface-variant" dangerouslySetInnerHTML={{__html: item.content}} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'hero': {
      const hr = block.hero || {};
      return (
        <div className="relative overflow-hidden rounded-2xl my-8 flex items-center justify-center" style={{ minHeight: hr.height || '300px', backgroundColor: hr.backgroundColor || '#0f172a', color: hr.textColor || '#fff', textAlign: (hr.align || 'center') as any }}>
          {hr.backgroundImage && <img src={hr.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 1 - (hr.overlay || 0.5) }} />}
          {hr.backgroundImage && <div className="absolute inset-0" style={{ backgroundColor: hr.backgroundColor || '#0f172a', opacity: hr.overlay || 0.5 }} />}
          <div className="relative z-10 p-8 md:p-12 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">{hr.title}</h2>
            {hr.subtitle && <p className="text-lg opacity-80 mb-6">{hr.subtitle}</p>}
            {hr.cta && <a href={hr.cta.url} className="inline-block px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity">{hr.cta.text}</a>}
          </div>
        </div>
      );
    }

    case 'alert': {
      const al = block.alert || block;
      const alertType = al.type || 'info';
      const alertStyles: Record<string, string> = {
        info: 'bg-blue-50 border-blue-500 text-blue-800',
        warning: 'bg-amber-50 border-amber-500 text-amber-800',
        error: 'bg-red-50 border-red-500 text-red-800',
        success: 'bg-emerald-50 border-emerald-500 text-emerald-800',
        announcement: 'bg-purple-50 border-purple-500 text-purple-800',
      };
      const alertIcons: Record<string, string> = { info: 'info', warning: 'warning', error: 'error', success: 'check_circle', announcement: 'campaign' };
      return (
        <div className={`my-6 p-5 rounded-xl border-l-4 ${alertStyles[alertType] || alertStyles.info}`}>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-xl mt-0.5" style={{fontVariationSettings:"'FILL' 1"}}>{al.icon || alertIcons[alertType]}</span>
            <div>
              {al.title && <div className="font-bold mb-1">{al.title}</div>}
              <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: al.content}} />
            </div>
          </div>
        </div>
      );
    }

    case 'badges': {
      const bg = block.badgeGroup || { badges: [] };
      return (
        <div className="flex flex-wrap gap-2 my-6">
          {bg.badges?.map((b: any, i: number) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border" style={{ borderColor: (b.color || '#10b981') + '40', backgroundColor: (b.color || '#10b981') + '10', color: b.color || '#10b981' }}>
              {b.icon && <span className="material-symbols-outlined text-sm">{b.icon}</span>}
              {b.text}
            </span>
          ))}
        </div>
      );
    }

    case 'separator': {
      const sep = block.separator || {};
      if (sep.text) {
        return (
          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{sep.text}</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>
        );
      }
      if (sep.icon) {
        return (
          <div className="flex items-center justify-center gap-4 my-10">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="material-symbols-outlined text-primary">{sep.icon}</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>
        );
      }
      if (sep.style === 'gradient') {
        return <div className="my-10 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />;
      }
      return <hr className={`my-10 border-outline-variant/30 ${sep.style === 'dashed' ? 'border-dashed' : ''}`} />;
    }

    case 'bookmark': {
      const bk = block.bookmark || {};
      return (
        <a href={bk.url} target="_blank" rel="noopener noreferrer" className="flex my-6 border border-outline-variant/30 rounded-xl overflow-hidden hover:border-primary/50 transition-colors group">
          <div className="flex-1 p-5">
            <div className="flex items-center gap-2 mb-2">
              {bk.favicon && <img src={bk.favicon} alt="" className="w-4 h-4" />}
              {bk.siteName && <span className="text-xs text-on-surface-variant">{bk.siteName}</span>}
            </div>
            <div className="font-bold text-on-background group-hover:text-primary transition-colors mb-1">{bk.title || bk.url}</div>
            {bk.description && <p className="text-sm text-on-surface-variant line-clamp-2">{bk.description}</p>}
          </div>
          {bk.image && <div className="w-[200px] flex-shrink-0"><img src={bk.image} alt="" className="w-full h-full object-cover" /></div>}
        </a>
      );
    }

    case 'tabs': {
      const tb = block.tabs || { items: [] };
      return <TabsRenderer tabs={tb} />;
    }

    case 'chart': {
      const ch = block.chart || { labels: [], datasets: [] };
      if (ch.type === 'bar' || !ch.type) {
        return (
          <div className="my-8 bg-surface-container-low p-6 rounded-xl">
            {ch.title && <h4 className="font-bold text-on-background mb-4">{ch.title}</h4>}
            <div className="space-y-4">
              {ch.labels?.map((label: string, li: number) => (
                <div key={li}>
                  <div className="text-xs text-on-surface-variant mb-1 font-bold">{label}</div>
                  {ch.datasets?.map((ds: any, di: number) => (
                    <div key={di} className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-3 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${ds.data?.[li] || 0}%`, backgroundColor: ds.color || '#10b981' }} />
                      </div>
                      <span className="text-xs font-bold w-10 text-right" style={{ color: ds.color }}>{ds.data?.[li]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {ch.datasets?.length > 1 && (
              <div className="flex gap-4 mt-4 pt-4 border-t border-outline-variant/20">
                {ch.datasets.map((ds: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ds.color }} />
                    <span className="text-xs font-bold">{ds.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      return null;
    }

    case 'container': {
      const ct = block.container || {};
      return (
        <div className="my-6 rounded-xl overflow-hidden" style={{ backgroundColor: ct.backgroundColor, borderColor: ct.borderColor, borderWidth: ct.borderColor ? 1 : 0, borderStyle: 'solid', borderRadius: ct.borderRadius || 12, padding: ct.padding || 24, maxWidth: ct.maxWidth || '100%' }}>
          <div dangerouslySetInnerHTML={{ __html: ct.content || '' }} />
        </div>
      );
    }

    case 'testimonial': {
      const tm = block.testimonial || {};
      return (
        <div className="my-8 bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant/20">
          {tm.rating && (
            <div className="flex gap-0.5 mb-3">
              {Array.from({length: tm.rating}).map((_, i) => (
                <span key={i} className="material-symbols-outlined text-amber-500 text-lg" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
              ))}
            </div>
          )}
          <blockquote className="text-lg italic text-on-surface leading-relaxed mb-4">"{tm.quote}"</blockquote>
          <div className="flex items-center gap-3">
            {tm.avatar && <img src={tm.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />}
            <div>
              <div className="font-bold text-on-background text-sm">{tm.author}</div>
              {(tm.role || tm.company) && <div className="text-xs text-on-surface-variant">{[tm.role, tm.company].filter(Boolean).join(' · ')}</div>}
            </div>
          </div>
        </div>
      );
    }

    case 'banner': {
      const bn = block.banner || {};
      return (
        <div className="my-8 rounded-xl overflow-hidden" style={{ backgroundColor: bn.backgroundColor || '#065f46', color: bn.textColor || '#fff' }}>
          <div className="flex items-center gap-4 p-5 md:p-6">
            {bn.image && <img src={bn.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1">
              {bn.title && <div className="font-bold text-lg">{bn.title}</div>}
              {bn.content && <div className="text-sm opacity-80 mt-1" dangerouslySetInnerHTML={{__html: bn.content}} />}
            </div>
            {bn.url && <a href={bn.url} className="px-4 py-2 bg-white/20 rounded-lg text-sm font-bold hover:bg-white/30 transition-colors flex-shrink-0">Xem thêm</a>}
          </div>
        </div>
      );
    }

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

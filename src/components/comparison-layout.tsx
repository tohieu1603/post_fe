'use client';

import Link from 'next/link';
import { BlockRenderer } from './block-renderer';
import { ShareButtons } from './share-buttons';
import { ViewTracker } from './view-tracker';
import { CommentSection } from './comment-section';
import { formatDate, readingTimeText } from '@/lib/utils';
import type { Post, ContentBlock } from '@/lib/types';

/**
 * ComparisonLayout — layout VS cho bài so sánh
 * Dark header + VS hero + bảng có icon check/cancel + progress bars + sidebar verdict
 */

interface CompItem {
  name: string;
  color: string; // CSS color class prefix: emerald | blue | orange | purple
}

interface CompData {
  item1: CompItem;
  item2: CompItem;
  winner?: string;
  winnerReason?: string;
}

function parseComparison(post: Post): CompData {
  const extras = (post as any).extras;
  if (extras?.comparison) return extras.comparison;
  const m = post.title.match(/(.+?)\s+vs\.?\s+(.+?)(?:\s*[:—–\-]|$)/i);
  if (m) return { item1: { name: m[1].trim(), color: 'emerald' }, item2: { name: m[2].trim().replace(/[:—–\-].*$/, '').trim(), color: 'blue' } };
  return { item1: { name: 'A', color: 'emerald' }, item2: { name: 'B', color: 'blue' } };
}

// Render cell value — detect ✅ ❌ and percentages for special rendering
function CellValue({ value, colIndex }: { value: string; colIndex: number }) {
  const colColors = ['text-on-surface', 'text-emerald-500', 'text-blue-500', 'text-purple-500', 'text-amber-500'];
  const barColors = ['bg-on-surface', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
  const colorClass = colColors[colIndex] || 'text-on-surface';
  const barColor = barColors[colIndex] || 'bg-blue-500';

  // Strip HTML tags for detection, keep for display
  const plain = value.replace(/<[^>]*>/g, '');

  // Check/cross icons
  if (plain.includes('✅')) {
    const text = plain.replace('✅', '').trim();
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        {text && <span className={`font-bold text-sm ${colorClass}`}>{text}</span>}
      </div>
    );
  }
  if (plain.includes('❌')) {
    const text = plain.replace('❌', '').trim();
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="material-symbols-outlined text-red-500">cancel</span>
        {text && <span className={`font-bold text-sm ${colorClass}`}>{text}</span>}
      </div>
    );
  }

  // Percentage — show with progress bar
  const pctMatch = plain.match(/([\d.]+)%/);
  if (pctMatch && colIndex > 0) {
    const pct = parseFloat(pctMatch[1]);
    return (
      <div className="flex flex-col items-center gap-2">
        <span className={`font-black text-lg ${colorClass}`}>{plain}</span>
        <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden max-w-[180px]">
          <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>
    );
  }

  // Default — render HTML content
  return <span className={`font-bold ${colIndex === 0 ? 'text-on-surface font-medium' : colorClass}`} dangerouslySetInnerHTML={{ __html: value }} />;
}

/**
 * Custom block renderer for comparison — adds numbered sections + dual progress bars
 */
/**
 * Dual progress bar component — giống The Benchmarker
 */
function DualBar({ label, val1, val2, name1, name2 }: { label: string; val1: number; val2: number; name1: string; name2: string }) {
  const winner1 = val1 > val2;
  const winner2 = val2 > val1;
  return (
    <div className="bg-surface-container-low p-6 rounded-xl">
      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">{name1}</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-emerald-600 text-lg">{val1}</span>
              {winner1 && <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${val1}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{name2}</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-blue-600 text-lg">{val2}</span>
              {winner2 && <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${val2}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Extract all % metrics from table for auto-bars
 */
function extractBarsFromTable(blocks: ContentBlock[]): { label: string; v1: number; v2: number }[] {
  const table = blocks.find(b => b.type === 'table' && b.headers && b.headers.length >= 3);
  if (!table?.rows) return [];
  return table.rows.map(row => {
    // Strip HTML tags first
    const c1 = (row[1] || '').replace(/<[^>]*>/g, '');
    const c2 = (row[2] || '').replace(/<[^>]*>/g, '');
    // Match any number (with or without %)
    const m1 = c1.match(/([\d.]+)/);
    const m2 = c2.match(/([\d.]+)/);
    if (m1 && m2) {
      const v1 = parseFloat(m1[1]);
      const v2 = parseFloat(m2[1]);
      // Only scores 1-100 (skip things like "256K", "2M", "3.8B")
      if (v1 >= 1 && v1 <= 100 && v2 >= 1 && v2 <= 100) {
        return { label: (row[0] || '').replace(/<[^>]*>/g, ''), v1, v2 };
      }
    }
    return null;
  }).filter(Boolean) as any[];
}

function ComparisonBlocks({ blocks, allBlocks, comp }: { blocks: ContentBlock[]; allBlocks: ContentBlock[]; comp: CompData }) {
  // Group blocks by H2 sections
  const sections: { heading: ContentBlock; blocks: ContentBlock[] }[] = [];
  let current: { heading: ContentBlock; blocks: ContentBlock[] } | null = null;

  for (const block of blocks) {
    if (block.type === 'table') continue;
    if (block.type === 'heading' && block.level === 2) {
      if (current) sections.push(current);
      current = { heading: block, blocks: [] };
    } else if (current) {
      current.blocks.push(block);
    }
  }
  if (current) sections.push(current);

  // Get ALL % rows from main table — each becomes a bar for one section
  const tableBars = extractBarsFromTable(allBlocks);
  // Pre-compute which section gets which bar
  const sectionBars: (typeof tableBars[0] | null)[] = [];
  let tmpBarIdx = 0;
  for (let si = 0; si < sections.length; si++) {
    const h = (sections[si].heading.text || '').toLowerCase();
    const skip = h.includes('kết luận') || h.includes('faq') || h.includes('câu hỏi') || h.includes('tổng quan') || h.includes('giới thiệu') || h.includes('nên chọn') || si === 0;
    if (!skip && tmpBarIdx < tableBars.length) {
      sectionBars.push(tableBars[tmpBarIdx++]);
    } else {
      sectionBars.push(null);
    }
  }

  const barColors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500'];
  const textColors = ['text-emerald-600', 'text-blue-600', 'text-purple-600'];

  // Get header names for bar labels
  const mainTable = blocks.find(b => b.type === 'table' && b.headers && b.headers.length >= 3);
  const headerNames = mainTable?.headers?.slice(1) || [comp.item1.name, comp.item2.name];

  return (
    <>
      {sections.map((section, si) => {
        const sectionNum = si + 1;
        const h = section.heading.text || '';
        const bar = sectionBars[si] || null;

        return (
          <div key={section.heading.id} className="mb-4">
            <h2 id={section.heading.anchor} className="text-2xl md:text-3xl font-extrabold text-on-background mt-12 mb-6 tracking-tight scroll-mt-24">
              <span className="text-primary font-black">{String(sectionNum).padStart(2, '0')}.</span>{' '}
              {h}
            </h2>

            {section.blocks.length > 0 && (
              <div className="space-y-4">
                <BlockRenderer blocks={section.blocks} />
              </div>
            )}

            {/* Progress bars from table data */}
            {bar && (
              <div className="bg-surface-container-low p-6 rounded-xl mt-8">
                <div className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">{bar.label}</div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">{headerNames[0] || comp.item1.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-emerald-600">{bar.v1}</span>
                        {bar.v1 > bar.v2 && <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                      </div>
                    </div>
                    <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${bar.v1}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{headerNames[1] || comp.item2.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-blue-600">{bar.v2}</span>
                        {bar.v2 > bar.v1 && <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                      </div>
                    </div>
                    <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${bar.v2}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export function ComparisonLayout({
  post,
  relatedPosts = [],
  mostViewed = [],
}: {
  post: Post;
  relatedPosts?: any[];
  mostViewed?: any[];
}) {
  const comp = parseComparison(post);
  const blocks = post.contentBlocks ?? [];
  const tables = blocks.filter(b => b.type === 'table');
  const mainTable = tables[0];
  const mainTableId = mainTable?.id;
  const otherBlocks = blocks.filter(b => b.id !== mainTableId);
  const faqItems = post.faq ?? [];
  const tags = post.tags ?? [];
  const toc = post.contentStructure?.toc ?? [];
  const readingTime = post.readingTime ?? post.contentStructure?.readingTime ?? null;

  return (
    <>
      <ViewTracker slug={post.slug} />
      <main className="max-w-screen-2xl mx-auto mt-16 md:mt-20">

        {/* ══ HERO: VS Section ══ */}
        <section className="relative overflow-hidden px-4 md:px-8 pt-10 pb-20"
          style={{ background: 'linear-gradient(to bottom, rgba(5,46,22,0.3), var(--color-background))' }}>
          {/* Glow effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-600/8 rounded-full blur-[100px]" />
            <div className="absolute top-0 right-1/3 w-80 h-80 bg-blue-600/8 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="flex justify-center text-on-surface-variant text-sm mb-8 gap-2 font-medium">
              <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <span>&gt;</span>
              {post.category && (
                <>
                  <Link href={`/chuyen-muc/${post.category.slug}`} className="hover:text-primary transition-colors">{post.category.name}</Link>
                  <span>&gt;</span>
                </>
              )}
              <span className="text-on-surface">So sánh</span>
            </nav>

            {/* VS Logos */}
            <div className="flex justify-center items-center gap-8 md:gap-14 mb-10">
              <div className="text-center group">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-container-highest rounded-xl flex items-center justify-center shadow-xl border border-emerald-600/20 group-hover:border-emerald-600/40 transition-colors">
                  <span className="text-4xl md:text-6xl font-black text-emerald-500">{comp.item1.name.charAt(0)}</span>
                </div>
                <p className="mt-4 font-bold text-emerald-500 text-xs tracking-[0.2em] uppercase">{comp.item1.name}</p>
              </div>

              <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-emerald-600 to-blue-600 border-4 border-white/10 text-white font-black text-lg md:text-xl shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                VS
              </div>

              <div className="text-center group">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-container-highest rounded-xl flex items-center justify-center shadow-xl border border-blue-600/20 group-hover:border-blue-600/40 transition-colors">
                  <span className="text-4xl md:text-6xl font-black text-blue-500">{comp.item2.name.charAt(0)}</span>
                </div>
                <p className="mt-4 font-bold text-blue-500 text-xs tracking-[0.2em] uppercase">{comp.item2.name}</p>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-on-background leading-tight mb-4 tracking-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-base text-on-surface-variant leading-relaxed max-w-2xl mx-auto">{post.excerpt}</p>
            )}

            {/* Meta */}
            <p className="text-on-surface-variant font-medium tracking-widest uppercase text-xs mt-6">
              {formatDate(post.publishedAt)}
              {readingTime && ` • ${readingTimeText(readingTime)}`}
              {` • ${post.viewCount?.toLocaleString('vi-VN') ?? '0'} lượt xem`}
            </p>
          </div>
        </section>

        {/* ══ WINNER BANNER ══ */}
        {comp.winnerReason && (
          <div className="container mx-auto px-6 -mt-10 relative z-20 max-w-4xl">
            <div className="bg-surface-container-high p-6 md:p-8 rounded-xl border-b-4 border-primary flex flex-col md:flex-row items-center justify-center gap-4 shadow-2xl">
              <span className="material-symbols-outlined text-primary text-4xl md:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
              <p className="text-xl md:text-2xl font-black tracking-tight text-on-background text-center md:text-left uppercase">
                {comp.winnerReason}
              </p>
            </div>
          </div>
        )}

        {/* ══ MAIN COMPARISON TABLE — FULL WIDTH ══ */}
        {mainTable && (
          <section className="px-4 md:px-8 lg:px-12 py-12 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[2px] w-12 bg-primary" />
              <h2 className="text-primary text-xl font-bold tracking-tight uppercase">Thông số kỹ thuật và điểm chuẩn</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border-none">
                <thead>
                  <tr className="bg-surface-container-low">
                    {mainTable.headers?.map((h, i) => {
                      const headerStyles = [
                        'text-on-surface-variant',
                        'bg-emerald-600/5 border-t-4 border-emerald-600 text-emerald-600 text-center',
                        'bg-blue-600/5 border-t-4 border-blue-600 text-blue-600 text-center',
                        'bg-purple-600/5 border-t-4 border-purple-600 text-purple-600 text-center',
                        'bg-amber-600/5 border-t-4 border-amber-600 text-amber-600 text-center',
                      ];
                      return (
                      <th key={i} className={`p-5 md:p-7 font-black uppercase tracking-widest text-sm ${headerStyles[i] || headerStyles[1]}`}>
                        {h}
                      </th>
                    );})}
                  </tr>
                </thead>
                <tbody>
                  {mainTable.rows?.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={`p-4 md:p-6 text-base ${ci > 0 ? 'text-center' : ''}`}>
                          <CellValue value={cell} colIndex={ci} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ══ CONTENT + SIDEBAR ══ */}
        <div className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-screen-2xl">

          {/* Left: Analysis sections with numbered headings + dual bars */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {otherBlocks.length > 0 && (
              <div className="space-y-6 text-on-surface leading-relaxed text-base md:text-lg font-body">
                <ComparisonBlocks blocks={otherBlocks} allBlocks={blocks} comp={comp} />
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-8 pb-4">
                {tags.map((tag, i) => {
                  const colors = ['bg-emerald-50 text-emerald-700 border-emerald-200', 'bg-blue-50 text-blue-700 border-blue-200', 'bg-purple-50 text-purple-700 border-purple-200', 'bg-amber-50 text-amber-700 border-amber-200'];
                  return (
                    <Link key={tag} href={`/tim-kiem?q=${encodeURIComponent(tag)}`}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${colors[i % colors.length]}`}>
                      # {tag}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* FAQ */}
            {faqItems.length > 0 && (
              <section className="bg-surface-container-low p-5 md:p-8 rounded-2xl border border-outline-variant/30">
                <h3 className="text-xl font-black mb-6">Câu hỏi thường gặp</h3>
                <div className="space-y-4">
                  {faqItems.map((faq, i) => (
                    <details key={faq._id ?? i} className="group bg-surface-container-lowest p-4 rounded-xl">
                      <summary className="flex justify-between items-center cursor-pointer font-bold text-primary list-none">
                        {faq.question}
                        <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                      </summary>
                      <p className="mt-3 text-sm text-on-surface-variant">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Comments */}
            <section className="pt-8 border-t border-outline-variant/30">
              <CommentSection postId={post._id} />
            </section>

            {/* Related */}
            {relatedPosts.length > 0 && (
              <section className="pt-8 border-t border-outline-variant/30">
                <h3 className="text-xl font-black mb-6 border-b-2 border-on-surface pb-2 inline-block">Bài viết liên quan</h3>
                <div className="divide-y divide-outline-variant/20">
                  {relatedPosts.map((r) => (
                    <Link key={r._id} href={`/bai-viet/${r.slug}`} className="group flex gap-5 py-5 first:pt-0">
                      <div className="w-[180px] h-[110px] flex-shrink-0 rounded overflow-hidden">
                        {r.coverImage ? <img src={r.coverImage} alt={r.title} className="w-full h-full object-cover" loading="lazy" /> :
                          <div className="w-full h-full bg-surface-container-high flex items-center justify-center"><span className="material-symbols-outlined text-outline-variant text-3xl">article</span></div>}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-[15px] font-bold text-on-background leading-snug group-hover:text-primary transition-colors mb-1.5 line-clamp-2">{r.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          {r.category && <span className="text-primary font-semibold">{r.category.name}</span>}
                          {r.category && <span>·</span>}
                          <span>{formatDate(r.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">

              {/* TOC — đầu sidebar */}
              {toc.length > 0 && (
                <div className="bg-surface-container-low p-5 rounded-xl">
                  <h4 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">Nội dung bài viết</h4>
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li key={item.anchor}>
                        <a href={`#${item.anchor}`} className="text-sm text-on-surface-variant hover:text-primary transition-colors">{item.text}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verdict: Item 1 */}
              <div className="p-6 md:p-8 border-l-4 border-emerald-600 bg-surface-container-low rounded-r-xl">
                <div className="flex items-center gap-3 mb-5">
                  <span className="material-symbols-outlined text-emerald-500">lightbulb</span>
                  <h3 className="text-lg font-bold text-on-background">Chọn {comp.item1.name} nếu</h3>
                </div>
                <ul className="space-y-4 text-sm text-on-surface-variant">
                  {blocks.filter(b => b.type === 'list' && b.items?.some(item => {
                    const k = comp.item1.name.toLowerCase().split(' ')[0];
                    return item.toLowerCase().includes(k) || item.toLowerCase().includes('miễn phí') || item.toLowerCase().includes('local') || item.toLowerCase().includes('bảo mật');
                  })).slice(0, 1).flatMap(b => b.items?.slice(0, 4) ?? []).map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">check</span>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verdict: Item 2 */}
              <div className="p-6 md:p-8 border-l-4 border-blue-600 bg-surface-container-low rounded-r-xl">
                <div className="flex items-center gap-3 mb-5">
                  <span className="material-symbols-outlined text-blue-500">rocket_launch</span>
                  <h3 className="text-lg font-bold text-on-background">Chọn {comp.item2.name} nếu</h3>
                </div>
                <ul className="space-y-4 text-sm text-on-surface-variant">
                  {blocks.filter(b => b.type === 'list' && b.items?.some(item => {
                    const k = comp.item2.name.toLowerCase().split(' ')[0];
                    return item.toLowerCase().includes(k) || item.toLowerCase().includes('benchmark') || item.toLowerCase().includes('ecosystem') || item.toLowerCase().includes('mạnh nhất');
                  })).slice(0, 1).flatMap(b => b.items?.slice(0, 4) ?? []).map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5">check</span>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share */}
              <div className="p-5 bg-gradient-to-br from-emerald-600/5 to-blue-600/5 rounded-xl border border-outline-variant/10">
                <h4 className="text-on-background font-bold mb-4">Chia sẻ bài viết này</h4>
                <ShareButtons title={post.title} slug={post.slug} />
              </div>

              {/* Newsletter removed — không cần trong comparison */}

              {/* Most Viewed */}
              {mostViewed.length > 0 && (
                <div>
                  <h4 className="text-base font-bold text-on-surface mb-3 pb-2 border-b-2 border-emerald-600">Xem nhiều</h4>
                  {mostViewed.map((item, idx) => (
                    <Link key={item._id} href={`/bai-viet/${item.slug}`} className="flex gap-3 items-start py-2.5 border-b border-outline-variant/15 last:border-0 group">
                      <span className="text-xl font-black text-emerald-600/30 leading-none flex-shrink-0 w-6 group-hover:text-emerald-600 transition-colors">{idx + 1}</span>
                      <p className="text-sm leading-snug text-on-surface group-hover:text-emerald-700 transition-colors">{item.title}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

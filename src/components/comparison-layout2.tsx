'use client';

import Link from 'next/link';
import { BlockRenderer } from './block-renderer';
import { ShareButtons } from './share-buttons';
import { ViewTracker } from './view-tracker';
import { NewsletterForm } from './newsletter-form';
import { CommentSection } from './comment-section';
import { formatDate, readingTimeText } from '@/lib/utils';
import type { Post, ContentBlock } from '@/lib/types';

/**
 * ComparisonLayout2 — "Scoreboard Battle" style
 * Scoreboard card + dual progress bars + 4-column pros/cons + donut charts
 * Use: template="comparison2"
 */

interface CompItem { name: string; score?: number; color: string }
interface CompData { item1: CompItem; item2: CompItem; winner?: string; winnerReason?: string }

function parseComp(post: Post): CompData {
  const extras = (post as any).extras;
  if (extras?.comparison) {
    return {
      item1: { ...extras.comparison.item1, score: extras.comparison.item1.score || 82 },
      item2: { ...extras.comparison.item2, score: extras.comparison.item2.score || 78 },
      winner: extras.comparison.winner,
      winnerReason: extras.comparison.winnerReason,
    };
  }
  const m = post.title.match(/(.+?)\s+vs\.?\s+(.+?)(?:\s*[:—–\-]|$)/i);
  return {
    item1: { name: m?.[1]?.trim() || 'Model A', score: 82, color: 'emerald' },
    item2: { name: m?.[2]?.trim().replace(/[:—–\-].*$/, '').trim() || 'Model B', score: 78, color: 'blue' },
  };
}

// Extract metrics from table blocks for dual progress bars
function extractMetrics(blocks: ContentBlock[]): { label: string; val1: number; val2: number }[] {
  const table = blocks.find(b => b.type === 'table' && b.headers && b.headers.length >= 3);
  if (!table?.rows) return [];
  return table.rows.map(row => {
    const m1 = row[1]?.match(/([\d.]+)%?/);
    const m2 = row[2]?.match(/([\d.]+)%?/);
    if (m1 && m2) {
      return { label: row[0], val1: parseFloat(m1[1]), val2: parseFloat(m2[1]) };
    }
    return null;
  }).filter(Boolean) as any[];
}

// Extract pros/cons from list blocks
function extractProsConsFromBlocks(blocks: ContentBlock[], comp: CompData): { a_pros: string[]; a_cons: string[]; b_pros: string[]; b_cons: string[] } {
  const lists = blocks.filter(b => b.type === 'list');
  const result = { a_pros: [] as string[], a_cons: [] as string[], b_pros: [] as string[], b_cons: [] as string[] };

  // Find headings before lists to determine context
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 'list' && i > 0) {
      const prevHeading = blocks.slice(0, i).reverse().find(b => b.type === 'heading');
      const headingText = (prevHeading?.text || '').toLowerCase();
      const items = blocks[i].items || [];
      const name1 = comp.item1.name.toLowerCase().split(' ')[0];
      const name2 = comp.item2.name.toLowerCase().split(' ')[0];

      if (headingText.includes(name1) && (headingText.includes('mạnh') || headingText.includes('ưu') || headingText.includes('pros'))) {
        result.a_pros = items.slice(0, 4);
      } else if (headingText.includes(name2) && (headingText.includes('mạnh') || headingText.includes('ưu') || headingText.includes('pros'))) {
        result.b_pros = items.slice(0, 4);
      } else if (headingText.includes(name1)) {
        result.a_pros = items.slice(0, 4);
      } else if (headingText.includes(name2)) {
        result.b_pros = items.slice(0, 4);
      }
    }
  }

  return result;
}

// SVG Donut component
function Donut({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const colorMap: Record<string, string> = { emerald: '#10b981', blue: '#3b82f6', indigo: '#6366f1', orange: '#f59e0b' };
  const stroke = colorMap[color] || '#10b981';

  return (
    <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="transparent" stroke="currentColor" strokeWidth="16" className="text-surface-container" />
        <circle cx="100" cy="100" r={r} fill="transparent" stroke={stroke} strokeWidth="16"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-black text-4xl md:text-5xl text-on-background">{pct}%</span>
        <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: stroke }}>{label}</span>
      </div>
    </div>
  );
}

export function ComparisonLayout2({
  post,
  relatedPosts = [],
  mostViewed = [],
}: {
  post: Post;
  relatedPosts?: any[];
  mostViewed?: any[];
}) {
  const comp = parseComp(post);
  const blocks = post.contentBlocks ?? [];
  const mainTable = blocks.find(b => b.type === 'table' && b.headers && b.headers.length >= 3);
  const otherBlocks = blocks.filter(b => b !== mainTable);
  const metrics = extractMetrics(blocks);
  const prosCons = extractProsConsFromBlocks(blocks, comp);
  const faqItems = post.faq ?? [];
  const tags = post.tags ?? [];
  const readingTime = post.readingTime ?? post.contentStructure?.readingTime ?? null;

  const color1 = comp.item1.color || 'emerald';
  const color2 = comp.item2.color || 'blue';
  const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
    blue: { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
    indigo: { text: 'text-indigo-500', bg: 'bg-indigo-500', border: 'border-indigo-500', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]' },
    orange: { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]' },
  };
  const c1 = colorMap[color1] || colorMap.emerald;
  const c2 = colorMap[color2] || colorMap.blue;

  return (
    <>
      <ViewTracker slug={post.slug} />
      <main className="max-w-screen-2xl mx-auto mt-16 md:mt-20">

        {/* ═══ HERO ═══ */}
        <section className="relative h-[350px] md:h-[400px] w-full flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(to bottom, rgba(5,46,22,0.4), var(--color-background))' }}>
          {post.coverImage && (
            <img src={post.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
          <div className="relative z-10 text-center px-4">
            <div className="inline-block px-4 py-1 bg-primary text-on-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-4 rounded-sm">So sánh chi tiết</div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-on-background tracking-tight leading-tight max-w-4xl mx-auto">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-outline-variant" />
              <span className="text-on-surface-variant uppercase tracking-widest text-xs">
                {formatDate(post.publishedAt)} {readingTime && `• ${readingTimeText(readingTime)}`}
              </span>
              <span className="h-px w-12 bg-outline-variant" />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-16">

          {/* ═══ SCOREBOARD CARD ═══ */}
          <section className="grid grid-cols-1 md:grid-cols-7 gap-0 bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden shadow-xl">
            <div className="md:col-span-3 p-8 md:p-12 text-center md:text-left flex flex-col justify-center">
              <h3 className={`text-xs uppercase tracking-widest mb-2 font-bold ${c1.text}`}>{comp.item1.name}</h3>
              <div className={`text-7xl md:text-[100px] leading-none font-black ${c1.text} ${c1.glow}`}>{comp.item1.score || 82}</div>
              <p className="text-on-surface-variant text-xs uppercase mt-2 tracking-wide">Tổng điểm đánh giá</p>
            </div>
            <div className="md:col-span-1 flex flex-col items-center justify-center bg-surface-container-high py-6 md:py-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
              <div className="text-primary font-black italic text-3xl z-10">VS</div>
              <div className="h-16 w-px bg-primary/30 my-3 z-10" />
              <div className="text-[10px] uppercase tracking-widest text-primary z-10">Live</div>
            </div>
            <div className="md:col-span-3 p-8 md:p-12 text-center md:text-right flex flex-col justify-center">
              <h3 className={`text-xs uppercase tracking-widest mb-2 font-bold ${c2.text}`}>{comp.item2.name}</h3>
              <div className={`text-7xl md:text-[100px] leading-none font-black ${c2.text} ${c2.glow}`}>{comp.item2.score || 78}</div>
              <p className="text-on-surface-variant text-xs uppercase mt-2 tracking-wide">Tổng điểm đánh giá</p>
            </div>
          </section>

          {/* ═══ CATEGORY SCORES — dual progress bars ═══ */}
          {metrics.length > 0 && (
            <section className="bg-surface-container-low p-6 md:p-10 border border-outline-variant/30 rounded-xl">
              <h2 className="text-xl font-extrabold uppercase tracking-tight mb-8">Chỉ số chi tiết</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {metrics.map((m, i) => (
                  <div key={i} className="space-y-3">
                    <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">{m.label}</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full ${c1.bg} rounded-full ${c1.glow} transition-all`} style={{ width: `${m.val1}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${c1.text}`}>{m.val1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full ${c2.bg} rounded-full ${c2.glow} transition-all`} style={{ width: `${m.val2}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${c2.text}`}>{m.val2}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center gap-12">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${c1.bg} rounded-sm`} />
                  <span className="text-xs uppercase tracking-widest font-bold">{comp.item1.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${c2.bg} rounded-sm`} />
                  <span className="text-xs uppercase tracking-widest font-bold">{comp.item2.name}</span>
                </div>
              </div>
            </section>
          )}

          {/* ═══ MAIN TABLE (full width, styled) ═══ */}
          {mainTable && (
            <section className="bg-surface-container-low overflow-hidden border border-outline-variant/30 rounded-xl">
              <div className="bg-surface-container-high px-6 md:px-8 py-4 flex justify-between items-center">
                <h2 className="text-xl font-extrabold uppercase tracking-tight">Bảng xếp hạng chi tiết</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container border-b border-outline-variant/30">
                    <tr>
                      {mainTable.headers?.map((h, i) => (
                        <th key={i} className={`px-6 md:px-8 py-4 text-[11px] uppercase tracking-widest font-bold ${
                          i === 0 ? 'text-primary' : i === 1 ? c1.text : c2.text
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15">
                    {mainTable.rows?.map((row, ri) => (
                      <tr key={ri} className="hover:bg-surface-container-high/50 transition-colors">
                        {row.map((cell, ci) => (
                          <td key={ci} className={`px-6 md:px-8 py-5 text-sm ${ci === 0 ? 'font-medium text-on-surface' : ci === 1 ? `font-bold ${c1.text}` : `font-bold ${c2.text}`}`}>
                            {cell.includes('✅') ? (
                              <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                {cell.replace('✅', '').trim()}
                              </span>
                            ) : cell.includes('❌') ? (
                              <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
                                {cell.replace('❌', '').trim()}
                              </span>
                            ) : (
                              <span dangerouslySetInnerHTML={{ __html: cell }} />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══ PROS/CONS 4-COLUMN ═══ */}
          {(prosCons.a_pros.length > 0 || prosCons.b_pros.length > 0) && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant/20 border border-outline-variant/30 rounded-xl overflow-hidden">
              <div className="bg-surface-container-low p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-emerald-500">
                  <span className="material-symbols-outlined">add_circle</span>
                  <h3 className="text-xs font-bold uppercase tracking-widest">{comp.item1.name} Ưu điểm</h3>
                </div>
                <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                  {prosCons.a_pros.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: `• ${item}` }} />)}
                </ul>
              </div>
              <div className="bg-surface-container-low p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <span className="material-symbols-outlined">remove_circle</span>
                  <h3 className="text-xs font-bold uppercase tracking-widest">{comp.item1.name} Nhược điểm</h3>
                </div>
                <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                  {prosCons.a_cons.length > 0 ? prosCons.a_cons.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: `• ${item}` }} />) :
                    <li>• Xem phân tích chi tiết bên dưới</li>}
                </ul>
              </div>
              <div className="bg-surface-container-low p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-emerald-500">
                  <span className="material-symbols-outlined">add_circle</span>
                  <h3 className="text-xs font-bold uppercase tracking-widest">{comp.item2.name} Ưu điểm</h3>
                </div>
                <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                  {prosCons.b_pros.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: `• ${item}` }} />)}
                </ul>
              </div>
              <div className="bg-surface-container-low p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <span className="material-symbols-outlined">remove_circle</span>
                  <h3 className="text-xs font-bold uppercase tracking-widest">{comp.item2.name} Nhược điểm</h3>
                </div>
                <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                  {prosCons.b_cons.length > 0 ? prosCons.b_cons.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: `• ${item}` }} />) :
                    <li>• Xem phân tích chi tiết bên dưới</li>}
                </ul>
              </div>
            </section>
          )}

          {/* ═══ ARTICLE CONTENT ═══ */}
          {otherBlocks.length > 0 && (
            <section>
              <div className="space-y-6 text-on-surface leading-relaxed text-base md:text-lg font-body">
                <BlockRenderer blocks={otherBlocks.filter(b => b.type !== 'table')} />
              </div>
            </section>
          )}

          {/* ═══ DONUT CHARTS — final score ═══ */}
          <section className="bg-surface-container-low p-8 md:p-12 border border-outline-variant/30 rounded-xl text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-primary">Tổng kết trận đấu</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <Donut pct={comp.item1.score || 82} color={color1} label={comp.item1.name} />
              <div className="text-primary font-bold uppercase text-xs tracking-[0.5em]">vs</div>
              <Donut pct={comp.item2.score || 78} color={color2} label={comp.item2.name} />
            </div>
            {comp.winnerReason && (
              <p className="text-on-surface-variant text-sm mt-4">{comp.winnerReason}</p>
            )}
          </section>

          {/* ═══ FAQ ═══ */}
          {faqItems.length > 0 && (
            <section className="bg-surface-container-low p-5 md:p-8 rounded-xl border border-outline-variant/30">
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

          {/* Tags + Newsletter + Comments */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <Link key={tag} href={`/tim-kiem?q=${encodeURIComponent(tag)}`}
                  className="px-4 py-1.5 rounded-full text-xs font-bold border bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:text-primary hover:border-primary transition-colors">
                  # {tag}
                </Link>
              ))}
            </div>
          )}

          <div className="rounded-lg p-6 text-white" style={{ background: 'linear-gradient(135deg, #065f46, #064e3b)' }}>
            <h4 className="text-lg font-bold mb-2">Bản tin AI hàng ngày</h4>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Tin tức AI quan trọng nhất, gửi thẳng vào hộp thư mỗi sáng.</p>
            <NewsletterForm vertical />
          </div>

          <section className="pt-8 border-t border-outline-variant/30">
            <CommentSection postId={post._id} />
          </section>
        </div>
      </main>
    </>
  );
}

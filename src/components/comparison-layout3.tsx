'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BlockRenderer } from './block-renderer';
import { ViewTracker } from './view-tracker';
import { NewsletterForm } from './newsletter-form';
import { CommentSection } from './comment-section';
import { formatDate, readingTimeText } from '@/lib/utils';
import type { Post, ContentBlock } from '@/lib/types';

/**
 * ComparisonLayout3 — "Scoreboard Battle" style (Gridiron Obsidian inspired)
 * Dark sections + scoreboard card + category dual bars + ranking table + pros/cons grid + donut charts
 * Use: template="comparison3"
 */

interface CompItem { name: string; score?: number; color: string }
interface CompData { item1: CompItem; item2: CompItem; winner?: string; winnerReason?: string }

function parseComp(post: Post): CompData {
  const extras = (post as any).extras;
  if (extras?.comparison) return { item1: { score: 82, ...extras.comparison.item1 }, item2: { score: 78, ...extras.comparison.item2 }, winner: extras.comparison.winner, winnerReason: extras.comparison.winnerReason };
  const m = post.title.match(/(.+?)\s+vs\.?\s+(.+?)(?:\s*[:—–\-]|$)/i);
  return { item1: { name: m?.[1]?.trim() || 'A', score: 82, color: 'emerald' }, item2: { name: m?.[2]?.trim().replace(/[:—–\-].*$/, '').trim() || 'B', score: 78, color: 'indigo' } };
}

function extractMetrics(blocks: ContentBlock[]): { label: string; v1: number; v2: number }[] {
  const table = blocks.find(b => b.type === 'table' && b.headers && b.headers.length >= 3);
  if (!table?.rows) return [];
  return table.rows.map(row => {
    const c1 = (row[1] || '').replace(/<[^>]*>/g, '');
    const c2 = (row[2] || '').replace(/<[^>]*>/g, '');
    const m1 = c1.match(/([\d.]+)/);
    const m2 = c2.match(/([\d.]+)/);
    if (m1 && m2) { const v1 = parseFloat(m1[1]); const v2 = parseFloat(m2[1]); if (v1 >= 1 && v1 <= 100 && v2 >= 1 && v2 <= 100) return { label: (row[0] || '').replace(/<[^>]*>/g, ''), v1, v2 }; }
    return null;
  }).filter(Boolean) as any[];
}

function extractProsFromBlocks(blocks: ContentBlock[], name: string): string[] {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 'list') {
      const prev = blocks.slice(0, i).reverse().find(b => b.type === 'heading');
      if (prev?.text?.toLowerCase().includes(name.toLowerCase().split(' ')[0])) return (blocks[i].items || []).slice(0, 4);
    }
  }
  return [];
}

// Donut SVG
function Donut({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 85; const circ = 2 * Math.PI * r; const offset = circ - (pct / 100) * circ;
  const colors: Record<string, string> = { emerald: '#10b981', indigo: '#6366f1', blue: '#3b82f6', purple: '#8b5cf6', amber: '#f59e0b' };
  const stroke = colors[color] || '#10b981';
  return (
    <div className="relative w-52 h-52 md:w-64 md:h-64 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="transparent" stroke="currentColor" strokeWidth="18" className="text-surface-container" />
        <circle cx="100" cy="100" r={r} fill="transparent" stroke={stroke} strokeWidth="18" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-black text-4xl md:text-5xl text-on-background">{pct}%</span>
        <span className="text-[10px] uppercase tracking-widest mt-1 font-bold" style={{ color: stroke }}>{label}</span>
      </div>
    </div>
  );
}

export function ComparisonLayout3({ post, relatedPosts = [], mostViewed = [] }: { post: Post; relatedPosts?: any[]; mostViewed?: any[] }) {
  const comp = parseComp(post);
  const blocks = post.contentBlocks ?? [];
  const mainTable = blocks.find(b => b.type === 'table' && b.headers && b.headers.length >= 3);
  const otherBlocks = blocks.filter(b => b.id !== mainTable?.id);
  const metrics = extractMetrics(blocks);
  const faqItems = post.faq ?? [];
  const tags = post.tags ?? [];
  const toc = post.contentStructure?.toc ?? [];
  const readingTime = post.readingTime ?? post.contentStructure?.readingTime ?? null;

  const c1Colors: Record<string, { text: string; bg: string; glow: string }> = {
    emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]' },
    indigo: { text: 'text-indigo-500', bg: 'bg-indigo-500', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.25)]' },
    blue: { text: 'text-blue-500', bg: 'bg-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.25)]' },
    purple: { text: 'text-purple-500', bg: 'bg-purple-500', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.25)]' },
  };
  const s1 = c1Colors[comp.item1.color] || c1Colors.emerald;
  const s2 = c1Colors[comp.item2.color] || c1Colors.indigo;

  const a_pros = extractProsFromBlocks(otherBlocks, comp.item1.name);
  const b_pros = extractProsFromBlocks(otherBlocks, comp.item2.name);

  // Sections for numbered headings
  const sections: { heading: ContentBlock; blocks: ContentBlock[] }[] = [];
  let cur: { heading: ContentBlock; blocks: ContentBlock[] } | null = null;
  for (const b of otherBlocks) {
    if (b.type === 'table') continue;
    if (b.type === 'heading' && b.level === 2) { if (cur) sections.push(cur); cur = { heading: b, blocks: [] }; }
    else if (cur) cur.blocks.push(b);
  }
  if (cur) sections.push(cur);

  // Nav items from TOC
  const navItems = [
    { icon: 'bolt', label: 'Hero', anchor: '' },
    { icon: 'leaderboard', label: 'Scoreboard', anchor: 'scoreboard' },
    { icon: 'query_stats', label: 'Chỉ số', anchor: 'metrics' },
    { icon: 'table_chart', label: 'Bảng', anchor: 'table' },
    { icon: 'thumbs_up_down', label: 'Ưu/Nhược', anchor: 'pros-cons' },
    { icon: 'donut_large', label: 'Tổng kết', anchor: 'summary' },
  ];

  return (
    <>
      <ViewTracker slug={post.slug} />
      <main className="max-w-screen-2xl mx-auto mt-16 md:mt-20">

        {/* ═══ HERO ═══ */}
        <section className="relative h-[350px] md:h-[400px] w-full flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(to bottom, rgba(5,46,22,0.5), var(--color-background))' }}>
          {post.coverImage && <img src={post.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 grayscale contrast-125" />}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
          <div className="relative z-10 text-center px-4">
            <div className="inline-block px-4 py-1 bg-primary text-on-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-4 rounded-sm">Scoreboard Battle</div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-on-background tracking-tight uppercase">{post.title}</h1>
            <div className="mt-4 flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-outline-variant" />
              <span className="text-on-surface-variant uppercase tracking-widest text-xs font-bold">{formatDate(post.publishedAt)} {readingTime && `• ${readingTimeText(readingTime)}`}</span>
              <span className="h-px w-12 bg-outline-variant" />
            </div>
          </div>
        </section>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-16">

          {/* ═══ SCOREBOARD CARD ═══ */}
          <section id="scoreboard" className="grid grid-cols-1 md:grid-cols-7 gap-0 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <div className="md:col-span-3 p-10 md:p-14 text-center flex flex-col items-center justify-center">
              <h3 className={`text-[11px] uppercase tracking-[0.2em] mb-4 font-bold ${s1.text}`}>{comp.item1.name}</h3>
              <div className={`text-8xl md:text-[130px] leading-none font-black ${s1.text}`} style={{ textShadow: `0 0 60px ${comp.item1.color === 'indigo' ? 'rgba(99,102,241,0.4)' : comp.item1.color === 'emerald' ? 'rgba(16,185,129,0.4)' : 'rgba(59,130,246,0.4)'}` }}>{comp.item1.score || 82}</div>
              <p className="text-slate-400 text-[10px] uppercase mt-3 tracking-widest font-bold">Tổng điểm đánh giá</p>
            </div>
            <div className="md:col-span-1 flex flex-col items-center justify-center py-6 md:py-0 relative" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-amber-400 font-black italic text-4xl transform -skew-x-6">VS</div>
              <div className="h-20 w-px bg-amber-400/20 my-4" />
              <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-bold">Live</div>
            </div>
            <div className="md:col-span-3 p-10 md:p-14 text-center flex flex-col items-center justify-center">
              <h3 className={`text-[11px] uppercase tracking-[0.2em] mb-4 font-bold ${s2.text}`}>{comp.item2.name}</h3>
              <div className={`text-8xl md:text-[130px] leading-none font-black ${s2.text}`} style={{ textShadow: `0 0 60px ${comp.item2.color === 'indigo' ? 'rgba(99,102,241,0.4)' : comp.item2.color === 'emerald' ? 'rgba(16,185,129,0.4)' : 'rgba(59,130,246,0.4)'}` }}>{comp.item2.score || 78}</div>
              <p className="text-slate-400 text-[10px] uppercase mt-3 tracking-widest font-bold">Tổng điểm đánh giá</p>
            </div>
          </section>

          {/* ═══ CATEGORY SCORES — dual bars ═══ */}
          {metrics.length > 0 && (
            <section id="metrics" className="bg-surface-container-low p-6 md:p-10 border border-outline-variant/30 rounded-xl">
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight">Chỉ số chi tiết</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {metrics.map((m, i) => (
                  <div key={i} className="space-y-3">
                    <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">{m.label}</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-surface-container-highest rounded-sm overflow-hidden">
                          <div className={`h-full ${s1.bg} ${s1.glow}`} style={{ width: `${m.v1}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${s1.text}`}>{m.v1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-surface-container-highest rounded-sm overflow-hidden">
                          <div className={`h-full ${s2.bg} ${s2.glow}`} style={{ width: `${m.v2}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${s2.text}`}>{m.v2}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center gap-12">
                <div className="flex items-center gap-2"><div className={`w-3 h-3 ${s1.bg} rounded-sm`} /><span className="text-xs uppercase tracking-widest font-bold">{comp.item1.name}</span></div>
                <div className="flex items-center gap-2"><div className={`w-3 h-3 ${s2.bg} rounded-sm`} /><span className="text-xs uppercase tracking-widest font-bold">{comp.item2.name}</span></div>
              </div>
            </section>
          )}

          {/* ═══ DETAILED TABLE ═══ */}
          {mainTable && (
            <section id="table" className="bg-surface-container-low overflow-hidden border border-outline-variant/30 rounded-xl">
              <div className="bg-surface-container-high px-6 md:px-8 py-4 flex justify-between items-center">
                <h2 className="text-xl font-extrabold uppercase tracking-tight">Bảng xếp hạng chi tiết</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container border-b border-outline-variant/30">
                    <tr>
                      {mainTable.headers?.map((h, i) => (
                        <th key={i} className={`px-6 md:px-8 py-4 text-[11px] uppercase tracking-widest font-bold ${i === 0 ? 'text-primary' : i === 1 ? s1.text : s2.text}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15">
                    {mainTable.rows?.map((row, ri) => (
                      <tr key={ri} className="hover:bg-surface-container-high/50 transition-colors">
                        {row.map((cell, ci) => {
                          const plain = cell.replace(/<[^>]*>/g, '');
                          return (
                            <td key={ci} className={`px-6 md:px-8 py-5 text-sm ${ci === 0 ? 'font-medium text-on-surface' : ci === 1 ? `font-bold ${s1.text}` : `font-bold ${s2.text}`}`}>
                              {plain.includes('✅') ? (
                                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>{plain.replace('✅', '').trim()}</span>
                              ) : plain.includes('❌') ? (
                                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-red-500 text-lg">cancel</span>{plain.replace('❌', '').trim()}</span>
                              ) : (
                                <span dangerouslySetInnerHTML={{ __html: cell }} />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══ PROS/CONS 4-COLUMN ═══ */}
          {(a_pros.length > 0 || b_pros.length > 0) && (
            <section id="pros-cons" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant/20 border border-outline-variant/30 rounded-xl overflow-hidden">
              <div className="bg-surface-container-low p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-emerald-500"><span className="material-symbols-outlined">add_circle</span><h3 className="text-xs font-bold uppercase tracking-widest">{comp.item1.name} Ưu điểm</h3></div>
                <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed">{a_pros.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: `• ${item}` }} />)}</ul>
              </div>
              <div className="bg-surface-container-low p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-red-500"><span className="material-symbols-outlined">remove_circle</span><h3 className="text-xs font-bold uppercase tracking-widest">{comp.item1.name} Nhược điểm</h3></div>
                <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed"><li>• Xem phân tích chi tiết bên dưới</li></ul>
              </div>
              <div className="bg-surface-container-low p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-emerald-500"><span className="material-symbols-outlined">add_circle</span><h3 className="text-xs font-bold uppercase tracking-widest">{comp.item2.name} Ưu điểm</h3></div>
                <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed">{b_pros.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: `• ${item}` }} />)}</ul>
              </div>
              <div className="bg-surface-container-low p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-red-500"><span className="material-symbols-outlined">remove_circle</span><h3 className="text-xs font-bold uppercase tracking-widest">{comp.item2.name} Nhược điểm</h3></div>
                <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed"><li>• Xem phân tích chi tiết bên dưới</li></ul>
              </div>
            </section>
          )}

          {/* ═══ ARTICLE CONTENT (numbered sections) ═══ */}
          <div className="space-y-6 text-on-surface leading-relaxed text-base md:text-lg font-body">
            {sections.map((sec, si) => (
              <div key={sec.heading.id}>
                <h2 id={sec.heading.anchor} className="text-2xl md:text-3xl font-extrabold text-on-background mt-10 mb-5 tracking-tight scroll-mt-24 uppercase">
                  <span className="text-primary font-black italic">{String(si + 1).padStart(2, '0')}.</span>{' '}{sec.heading.text}
                </h2>
                {sec.blocks.length > 0 && <BlockRenderer blocks={sec.blocks} />}
              </div>
            ))}
          </div>

          {/* ═══ DONUT CHARTS ═══ */}
          <section id="summary" className="bg-surface-container-low p-8 md:p-12 border border-outline-variant/30 rounded-xl text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-primary">Tổng kết trận đấu</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <Donut pct={comp.item1.score || 82} color={comp.item1.color} label={comp.item1.name} />
              <div className="text-primary font-bold uppercase text-xs tracking-[0.5em]">vs</div>
              <Donut pct={comp.item2.score || 78} color={comp.item2.color} label={comp.item2.name} />
            </div>
            {comp.winnerReason && <p className="text-on-surface-variant text-sm">{comp.winnerReason}</p>}
          </section>

          {/* ═══ FAQ ═══ */}
          {faqItems.length > 0 && (
            <section className="bg-surface-container-low p-5 md:p-8 rounded-xl border border-outline-variant/30">
              <h3 className="text-xl font-black mb-6">Câu hỏi thường gặp</h3>
              <div className="space-y-4">
                {faqItems.map((faq, i) => (
                  <details key={faq._id ?? i} className="group bg-surface-container-lowest p-4 rounded-xl">
                    <summary className="flex justify-between items-center cursor-pointer font-bold text-primary list-none">{faq.question}<span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span></summary>
                    <p className="mt-3 text-sm text-on-surface-variant">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Tags + Newsletter + Comments */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">{tags.map(tag => (
              <Link key={tag} href={`/tim-kiem?q=${encodeURIComponent(tag)}`} className="px-4 py-1.5 rounded-full text-xs font-bold border bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:text-primary transition-colors"># {tag}</Link>
            ))}</div>
          )}
          <div className="rounded-lg p-6 text-white" style={{ background: 'linear-gradient(135deg, #065f46, #064e3b)' }}>
            <h4 className="text-lg font-bold mb-2">Bản tin AI hàng ngày</h4>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Tin tức AI quan trọng nhất, gửi thẳng vào hộp thư mỗi sáng.</p>
            <NewsletterForm vertical />
          </div>
          <section className="pt-8 border-t border-outline-variant/30"><CommentSection postId={post._id} /></section>
        </div>
      </main>
    </>
  );
}

'use client';
import { API } from '@/lib/api';

import { useState, useEffect, useCallback } from 'react';


interface SeoScore {
  _id?: string;
  postId?: string;
  title?: string;
  slug?: string;
  score?: number;
  status?: string;
  updatedAt?: string;
}

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}`,
});

function ScoreBadge({ score }: { score?: number }) {
  if (score == null) return <span className="text-slate-400 text-xs">—</span>;
  const color = score >= 80 ? 'bg-emerald-100 text-emerald-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{score}</span>;
}

export default function SeoPage() {
  const [scores, setScores] = useState<SeoScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auto-seo/scores?page=1&limit=20`, { headers: authHeaders() });
      if (!res.ok) { setUnavailable(true); return; }
      const json = await res.json();
      const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : null);
      if (items !== null) setScores(items);
      else setUnavailable(true);
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScores(); }, [fetchScores]);

  if (unavailable) {
    return (
      <div className="p-6 bg-slate-50 min-h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">SEO</h2>
          <p className="text-slate-500 text-sm">Chức năng phân tích SEO đang được phát triển</p>
          <p className="text-slate-400 text-xs mt-2">API chưa sẵn sàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">SEO</h1>
          <p className="text-sm text-slate-500 mt-1">Điểm SEO của các bài viết</p>
        </div>
        <button onClick={fetchScores} className="text-sm text-slate-500 hover:text-emerald-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-white transition-colors">
          Làm mới
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Đang tải...</div>
        ) : scores.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Chưa có dữ liệu SEO</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Bài viết', 'Slug', 'Điểm SEO', 'Trạng thái', 'Cập nhật'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scores.map((item, i) => (
                <tr key={item._id || i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{item.title || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs max-w-xs truncate">{item.slug || '—'}</td>
                  <td className="px-4 py-3"><ScoreBadge score={item.score} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{item.status || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

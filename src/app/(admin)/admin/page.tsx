'use client';
import { API } from '@/lib/api';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });


interface PostItem {
  _id: string;
  title: string;
  slug: string;
  status?: string;
  publishedAt?: string | null;
  createdAt: string;
  viewCount: number;
  category?: { _id: string; name: string; slug: string } | null;
  authorInfo?: { name: string; avatarUrl?: string | null } | null;
  author?: string | null;
}

interface DashboardData {
  totalPosts: number;
  totalCategories: number;
  recentPosts: PostItem[];
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

function getTodayVietnamese(): string {
  const now = new Date();
  return now.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status?: string }) {
  if (!status || status === 'published') {
    return (
      <span className="px-2 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-md">
        PUBLISHED
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md">
        DRAFT
      </span>
    );
  }
  if (status === 'archived') {
    return (
      <span className="px-2 py-1 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-md">
        ARCHIVED
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md">
      {status.toUpperCase()}
    </span>
  );
}

function buildDailyViewBars(posts: PostItem[]): { label: string; pct: number; value: number }[] {
  // Build last-7-days labels
  const days: { label: string; key: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('vi-VN', { weekday: 'short' });
    days.push({ label, key });
  }

  // Distribute post viewCounts by createdAt date into the 7-day window
  const totals: Record<string, number> = {};
  days.forEach(({ key }) => { totals[key] = 0; });
  posts.forEach((p) => {
    const key = new Date(p.createdAt).toISOString().slice(0, 10);
    if (key in totals) totals[key] += p.viewCount || 0;
  });

  const values = days.map(({ key }) => totals[key]);
  const max = Math.max(...values, 1);
  return days.map(({ label }, i) => ({
    label,
    value: values[i],
    pct: Math.round((values[i] / max) * 100),
  }));
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return; // layout handles redirect

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.name) setAdminName(user.name);
      }
    } catch {}

    async function fetchDashboard() {
      try {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const [postsRes, categoriesRes, latestRes] = await Promise.allSettled([
          fetch(`${API}/api/posts?page=1&limit=10&status=published`, { headers }),
          fetch(`${API}/api/categories`, { headers }),
          fetch(`${API}/api/public/home/latest?limit=5`),
        ]);

        let totalPosts = 0;
        let totalCategories = 0;
        let recentPosts: PostItem[] = [];

        if (postsRes.status === 'fulfilled' && postsRes.value.ok) {
          const json = await postsRes.value.json();
          totalPosts = json?.pagination?.total ?? json?.data?.length ?? 0;
          recentPosts = json?.data ?? [];
        }

        if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
          const json = await categoriesRes.value.json();
          const cats = Array.isArray(json) ? json : (json.data || []);
          totalCategories = cats.length;
        }

        if (recentPosts.length === 0 && latestRes.status === 'fulfilled' && latestRes.value.ok) {
          const json = await latestRes.value.json();
          recentPosts = json?.data ?? [];
        }

        setData({ totalPosts, totalCategories, recentPosts });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const totalViews = data?.recentPosts.reduce((acc, p) => acc + (p.viewCount || 0), 0) ?? 0;
  const viewBars = buildDailyViewBars(data?.recentPosts ?? []);

  return (
    <div className="p-8 space-y-8">

      {/* Page heading */}
      <div>
        <h2 className="text-slate-900 font-bold text-2xl tracking-tight leading-tight">Dashboard</h2>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Xin chào, {adminName} — {getTodayVietnamese()}</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          Lỗi tải dữ liệu: {error}. Hiển thị dữ liệu mẫu.
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-slate-500 font-medium text-sm">Tổng bài viết</p>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">article</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {loading ? '—' : data?.totalPosts ?? 0}
              </h3>
              <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span>
                Hôm nay
              </div>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-slate-500 font-medium text-sm">Chuyên mục</p>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">category</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {loading ? '—' : data?.totalCategories ?? 0}
              </h3>
              <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span>
                Hoạt động
              </div>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-slate-500 font-medium text-sm">Lượt xem</p>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">visibility</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {loading ? '—' : formatViews(totalViews)}
              </h3>
              <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span>
                Tổng cộng
              </div>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-slate-500 font-medium text-sm">Doanh thu tháng</p>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">payments</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-extrabold text-slate-900 tabular-nums">—</h3>
              <div className="flex items-center text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Chưa có dữ liệu
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Views Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-slate-800">Lượt xem 7 ngày</h4>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-500 font-medium">Page Views</span>
            </div>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">Đang tải...</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewBars} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13 }}
                    labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                  />
                  <Bar dataKey="value" name="Lượt xem" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Traffic Trend — Area Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-slate-800">Xu hướng truy cập</h4>
            <span className="text-xs bg-emerald-50 text-emerald-600 rounded-md px-2 py-1 font-medium">7 ngày</span>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">Đang tải...</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewBars} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13 }}
                    labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="value" name="Lượt xem" stroke="#10b981" strokeWidth={2.5} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* Latest Articles Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-slate-50">
            <h4 className="text-lg font-bold text-slate-800">Bài viết mới nhất</h4>
            <Link href="/admin/bai-viet" className="text-emerald-600 text-sm font-semibold hover:underline">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tiêu đề</th>
                  <th className="px-6 py-4">Chuyên mục</th>
                  <th className="px-6 py-4">Tác giả</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày</th>
                  <th className="px-6 py-4 text-right">Lượt xem</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4" colSpan={7}>
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : (data?.recentPosts ?? []).map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 max-w-[200px] truncate">{post.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {post.category?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                          {post.authorInfo?.avatarUrl ? (
                            <img src={post.authorInfo.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (post.authorInfo?.name ?? post.author ?? 'A').charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-sm text-slate-700">
                          {post.authorInfo?.name ?? post.author ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right font-medium">
                      {(post.viewCount ?? 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <Link
                          href={`/admin/bai-viet/${post._id}`}
                          className="hover:text-emerald-600"
                          title="Sửa bài viết"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <Link
                          href={`/bai-viet/${post.slug}`}
                          className="hover:text-blue-600"
                          title="Xem bài viết"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-slate-50">
            <h4 className="text-lg font-bold text-slate-800">Thao tác nhanh</h4>
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex-1 p-4 space-y-3">
            <Link href="/admin/bai-viet/tao-moi" className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">add_circle</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">Tạo bài viết mới</span>
                <span className="text-xs text-slate-500">Viết và xuất bản</span>
              </div>
            </Link>
            <Link href="/admin/chuyen-muc" className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">category</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">Quản lý chuyên mục</span>
                <span className="text-xs text-slate-500">{loading ? '...' : `${data?.totalCategories ?? 0} chuyên mục`}</span>
              </div>
            </Link>
            <Link href="/admin/binh-luan" className="flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">forum</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">Duyệt bình luận</span>
                <span className="text-xs text-slate-500">Xem phản hồi mới</span>
              </div>
            </Link>
            <Link href="/admin/cai-dat" className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">settings</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">Cài đặt hệ thống</span>
                <span className="text-xs text-slate-500">Cấu hình website</span>
              </div>
            </Link>
          </div>
          <Link href="/admin" className="block w-full py-4 bg-slate-50 text-slate-500 text-xs font-bold hover:text-emerald-600 transition-colors text-center">
            XEM TẤT CẢ CHỨC NĂNG
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 flex justify-between items-center border-t border-slate-100">
        <span className="text-slate-400 text-[10px] font-normal uppercase tracking-widest">© 2026 AI Vietnam</span>
        <div className="flex gap-6">
          <a className="text-slate-400 text-xs font-normal hover:text-emerald-500 transition-colors" href="#">Privacy Policy</a>
          <a className="text-slate-400 text-xs font-normal hover:text-emerald-500 transition-colors" href="#">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

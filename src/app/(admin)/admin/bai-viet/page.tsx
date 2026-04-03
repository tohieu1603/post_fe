'use client';
import { API } from '@/lib/api';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


interface PostItem {
  _id: string;
  title: string;
  slug: string;
  status?: string;
  publishedAt?: string | null;
  createdAt: string;
  viewCount: number;
  coverImage?: string | null;
  category?: { _id: string; name: string; slug: string } | null;
  authorInfo?: { name: string; avatarUrl?: string | null } | null;
  author?: string | null;
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function StatusBadge({ status }: { status?: string }) {
  if (!status || status === 'published') {
    return (
      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center w-fit gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Đã xuất bản
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center w-fit gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Bản nháp
      </span>
    );
  }
  if (status === 'archived') {
    return (
      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold flex items-center w-fit gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        Lưu trữ
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center w-fit gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      {status}
    </span>
  );
}

function CategoryBadge({ name }: { name?: string }) {
  if (!name) return <span className="text-xs text-slate-400">—</span>;
  const colorMap: Record<string, string> = {
    'Hướng dẫn': 'bg-blue-50 text-blue-700',
    'Kỹ thuật': 'bg-blue-50 text-blue-700',
    'Tin tức AI': 'bg-slate-100 text-slate-600',
    'Tổng hợp': 'bg-purple-50 text-purple-700',
    'Sáng tạo': 'bg-orange-50 text-orange-700',
    'Xu hướng': 'bg-purple-50 text-purple-700',
    'Quan điểm': 'bg-slate-100 text-slate-600',
  };
  const cls = colorMap[name] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`px-2.5 py-1 rounded-full ${cls} text-[10px] font-bold uppercase`}>
      {name}
    </span>
  );
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = useCallback(async (token: string, page: number, status: StatusFilter, catId: string, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      });
      if (status !== 'all') params.set('status', status);
      if (catId) params.set('categoryId', catId);
      if (q) params.set('search', q);

      const res = await fetch(`${API}/api/posts?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setPosts(json?.data ?? []);
      if (json?.pagination) {
        setPagination(json.pagination);
      } else {
        setPagination({ page, limit: 10, total: json?.data?.length ?? 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      router.replace('/dang-nhap');
      return;
    }

    // Fetch categories
    fetch(`${API}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => setCategories(Array.isArray(json) ? json : (json.data ?? [])))
      .catch(() => {});

    fetchPosts(token, currentPage, statusFilter, categoryFilter, search);
  }, [router, currentPage, statusFilter, categoryFilter, search, fetchPosts]);

  const handleStatusTabChange = (s: StatusFilter) => {
    setStatusFilter(s);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleFilter = () => {
    setSearch(searchInput);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === posts.length && posts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts.map((p) => p._id)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá bài viết này?')) return;
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API}/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } catch {
      alert('Xoá thất bại');
    }
  };

  const handleBulkStatus = async (newStatus: 'published' | 'archived') => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await Promise.allSettled(
      ids.map((id) =>
        fetch(`${API}/api/posts/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: newStatus }),
        })
      )
    );
    setSelectedIds(new Set());
    const t = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
    fetchPosts(t, currentPage, statusFilter, categoryFilter, search);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Xoá ${selectedIds.size} bài viết đã chọn?`)) return;
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    const ids = Array.from(selectedIds);
    await Promise.allSettled(
      ids.map((id) =>
        fetch(`${API}/api/posts/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
    setSelectedIds(new Set());
    fetchPosts(token, currentPage, statusFilter, categoryFilter, search);
  };

  const totalPages = pagination.totalPages || 1;
  const pageNumbers: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    if (currentPage < totalPages - 2) pageNumbers.push('...');
    pageNumbers.push(totalPages);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-57px)] pb-20">

      {/* Sub-header: title + status tabs + create button */}
      <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-slate-100 sticky top-[57px] z-30">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-semibold text-slate-900">Quản lý Bài viết</h2>
          <div className="h-6 w-px bg-slate-200"></div>
          <nav className="flex gap-6">
            {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map((s) => {
              const labels: Record<StatusFilter, string> = {
                all: 'Tất cả',
                published: 'Đã xuất bản',
                draft: 'Bản nháp',
                archived: 'Thùng rác',
              };
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusTabChange(s)}
                  className={`text-sm font-medium transition-all pb-1 ${
                    active
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-slate-500 hover:text-emerald-600'
                  }`}
                >
                  {labels[s]}
                </button>
              );
            })}
          </nav>
        </div>
        <Link
          href="/admin/bai-viet/tao-moi"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Tạo bài mới
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <section className="px-8 py-6 bg-slate-50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-[300px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white text-sm placeholder:text-slate-400 shadow-sm transition-all outline-none"
              placeholder="Tìm kiếm tiêu đề, slug..."
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            />
          </div>
          <select
            className="rounded-xl border-none ring-1 ring-slate-200 bg-white py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 shadow-sm min-w-[140px] outline-none"
            value={statusFilter}
            onChange={(e) => handleStatusTabChange(e.target.value as StatusFilter)}
          >
            <option value="all">Trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <select
            className="rounded-xl border-none ring-1 ring-slate-200 bg-white py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 shadow-sm min-w-[160px] outline-none"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Chuyên mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={handleFilter}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
          >
            Lọc
          </button>
        </div>

        {/* Bulk Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              disabled={selectedIds.size === 0}
              onClick={() => handleBulkStatus('published')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedIds.size > 0
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                  : 'text-slate-400 bg-slate-100 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-lg">publish</span>
              Xuất bản
            </button>
            <button
              disabled={selectedIds.size === 0}
              onClick={() => handleBulkStatus('archived')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedIds.size > 0
                  ? 'text-slate-700 bg-slate-200 hover:bg-slate-300 cursor-pointer'
                  : 'text-slate-400 bg-slate-100 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-lg">archive</span>
              Lưu trữ
            </button>
            <button
              disabled={selectedIds.size === 0}
              onClick={handleBulkDelete}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedIds.size > 0
                  ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 cursor-pointer'
                  : 'text-slate-400 bg-slate-100 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              Xoá
            </button>
          </div>
          <div className="text-sm text-slate-500 font-medium italic">
            Đã chọn{' '}
            <span className="text-emerald-600 font-bold">{selectedIds.size}</span> mục
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="flex-1 px-8 pb-12 bg-slate-50">
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
            Lỗi: {error}
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
          <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 w-12">
                  <input
                    className="rounded text-emerald-600 focus:ring-emerald-600 border-slate-300"
                    type="checkbox"
                    checked={posts.length > 0 && selectedIds.size === posts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ảnh bìa</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chuyên mục</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tác giả</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt xem</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/50' : ''}>
                    <td className="px-6 py-4" colSpan={9}>
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                    </td>
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Không có bài viết nào.
                  </td>
                </tr>
              ) : (
                posts.map((post, i) => (
                  <tr key={post._id} className={`hover:bg-slate-50 transition-colors group ${i % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        className="rounded text-emerald-600 focus:ring-emerald-600 border-slate-300"
                        type="checkbox"
                        checked={selectedIds.has(post._id)}
                        onChange={() => toggleSelect(post._id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      {post.coverImage ? (
                        <img
                          alt="Thumbnail"
                          className="w-[60px] h-[40px] rounded object-cover bg-slate-200"
                          src={post.coverImage}
                        />
                      ) : (
                        <div className="w-[60px] h-[40px] rounded bg-slate-200 flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-400 text-xl">image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 text-sm max-w-[200px] truncate">{post.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{post.slug}</div>
                    </td>
                    <td className="px-4 py-4">
                      <CategoryBadge name={post.category?.name} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {post.authorInfo?.name ?? post.author ?? '—'}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500" style={{ fontFeatureSettings: "'tnum' on, 'lnum' on" }}>
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700" style={{ fontFeatureSettings: "'tnum' on, 'lnum' on" }}>
                      {(post.viewCount ?? 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/bai-viet/${post._id}`}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <Link
                          href={`/bai-viet/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Xem bài viết"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                        <button
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Xoá"
                          onClick={() => handleDelete(post._id)}
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && posts.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Hiển thị{' '}
              <span className="font-bold text-slate-900">
                {(currentPage - 1) * pagination.limit + 1}–{Math.min(currentPage * pagination.limit, pagination.total)}
              </span>{' '}
              /{' '}
              <span className="font-bold text-slate-900">{pagination.total}</span> bài viết
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-slate-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-colors ${
                      p === currentPage
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Footer bar */}
      <footer className="flex justify-between items-center px-8 py-4 bg-white border-t border-slate-200 fixed bottom-0 right-0 left-0 lg:left-[260px] z-40">
        <div className="text-emerald-600 font-bold text-sm">
          {selectedIds.size > 0 ? (
            <>
              <span className="material-symbols-outlined text-lg align-middle mr-1">check_circle</span>
              {selectedIds.size} bài đã chọn
            </>
          ) : (
            <span className="text-slate-400 font-normal">Chưa chọn bài viết nào</span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-slate-500 text-xs font-medium uppercase tracking-wide">
            <a className="hover:underline" href="#">Chính sách</a>
            <a className="hover:underline" href="#">Hỗ trợ kỹ thuật</a>
          </div>
          <div className="text-slate-400 text-xs">
            © 2026 AI Vietnam Administrative Control
          </div>
        </div>
      </footer>
    </div>
  );
}

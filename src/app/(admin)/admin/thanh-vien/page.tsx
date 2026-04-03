'use client';
import { API } from '@/lib/api';

import { useEffect, useState, useCallback } from 'react';


interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: 'admin' | 'editor' | 'author' | 'viewer';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type RoleFilter = 'all' | 'admin' | 'editor' | 'author' | 'viewer';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Biên tập',
  author: 'Tác giả',
  viewer: 'Độc giả',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-rose-50 text-rose-700',
  editor: 'bg-blue-50 text-blue-700',
  author: 'bg-emerald-50 text-emerald-700',
  viewer: 'bg-slate-100 text-slate-600',
};

function RoleBadge({ role }: { role: string }) {
  const cls = ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center w-fit gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
        Hoạt động
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold flex items-center w-fit gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
      Bị khoá
    </span>
  );
}

export default function AdminMembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('accessToken') || localStorage.getItem('token');

  const fetchUsers = useCallback(async (token: string, page: number, role: RoleFilter, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (role !== 'all') params.set('role', role);
      if (q) params.set('search', q);

      const res = await fetch(`${API}/api/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data ?? []);
      setUsers(items);
      if (json?.pagination) {
        setPagination(json.pagination);
      } else {
        setPagination({ page, limit: 10, total: items.length, totalPages: 1 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetchUsers(token, currentPage, roleFilter, search);
  }, [currentPage, roleFilter, search, fetchUsers]);

  const handleFilter = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (r: RoleFilter) => {
    setRoleFilter(r);
    setCurrentPage(1);
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    const token = getToken();
    if (!token) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`${API}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as User['role'] } : u))
      );
    } catch {
      alert('Cập nhật vai trò thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (userId: string) => {
    const token = getToken();
    if (!token) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`${API}/api/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      const updated = json?.data ?? json;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, isActive: updated?.isActive ?? !u.isActive }
            : u
        )
      );
    } catch {
      alert('Thay đổi trạng thái thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xoá tài khoản "${userName}"? Hành động này không thể hoàn tác.`)) return;
    const token = getToken();
    if (!token) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`${API}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch {
      alert('Xoá thành viên thất bại');
    } finally {
      setUpdatingId(null);
    }
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
    <div className="p-6 bg-slate-50 min-h-full">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Thành viên</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách tài khoản trong hệ thống</p>
        </div>
        <div className="text-sm text-slate-500">
          Tổng: <span className="font-bold text-slate-900">{pagination.total}</span> thành viên
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="mb-4 flex items-center gap-1 border-b border-slate-200">
        {(['all', 'admin', 'editor', 'author', 'viewer'] as RoleFilter[]).map((r) => {
          const labels: Record<RoleFilter, string> = {
            all: 'Tất cả',
            admin: 'Admin',
            editor: 'Biên tập',
            author: 'Tác giả',
            viewer: 'Độc giả',
          };
          return (
            <button
              key={r}
              onClick={() => handleRoleFilterChange(r)}
              className={`px-4 py-2 text-sm font-medium transition-all pb-2 ${
                roleFilter === r
                  ? 'text-[#059669] border-b-2 border-[#059669]'
                  : 'text-slate-500 hover:text-[#059669]'
              }`}
            >
              {labels[r]}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <div className="relative w-[300px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#059669] bg-white text-sm placeholder:text-slate-400 shadow-sm transition-all outline-none"
            placeholder="Tìm theo tên, email..."
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          />
        </div>
        <button
          onClick={handleFilter}
          className="bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#047857] active:scale-95 transition-all"
        >
          Lọc
        </button>
        {(search || roleFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setSearchInput(''); setRoleFilter('all'); setCurrentPage(1); }}
            className="text-sm text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Xoá lọc
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          Lỗi: {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Avatar</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày tham gia</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4" colSpan={7}>
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-medium">Không tìm thấy thành viên nào.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isProcessing = updatingId === user.id;
                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50 transition-colors ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {/* Avatar */}
                    <td className="px-6 py-4">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm overflow-hidden border border-slate-200">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          (user.name || user.email || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900 text-sm">{user.name || '—'}</div>
                      {user.lastLoginAt && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Đăng nhập: {formatDate(user.lastLoginAt)}
                        </div>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4 text-sm text-slate-600 max-w-[200px]">
                      <span className="truncate block">{user.email}</span>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <select
                        className="rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#059669] focus:border-transparent outline-none cursor-pointer transition-all hover:border-slate-300"
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        disabled={isProcessing}
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Biên tập</option>
                        <option value="author">Tác giả</option>
                        <option value="viewer">Độc giả</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <ActiveBadge isActive={user.isActive} />
                    </td>

                    {/* Joined date */}
                    <td className="px-4 py-4 text-sm text-slate-500" style={{ fontFeatureSettings: "'tnum' on, 'lnum' on" }}>
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          disabled={isProcessing}
                          title={user.isActive ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.isActive
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {user.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            )}
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(user.id, user.name || user.email)}
                          disabled={isProcessing}
                          title="Xoá thành viên"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Hiển thị{' '}
            <span className="font-bold text-slate-900">
              {(currentPage - 1) * pagination.limit + 1}–{Math.min(currentPage * pagination.limit, pagination.total)}
            </span>
            {' '}/ <span className="font-bold text-slate-900">{pagination.total}</span> thành viên
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#059669] transition-colors disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
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
                      ? 'bg-[#059669] text-white shadow-md'
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
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#059669] transition-colors disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { API } from '@/lib/api';

import { useState, useEffect, useCallback } from 'react';


interface Author {
  _id: string;
  name: string;
  slug: string;
  jobTitle?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: Record<string, string>;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  };
}

const emptyForm = { name: '', slug: '', jobTitle: '', bio: '', avatarUrl: '' };

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/authors`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data ?? []);
      setAuthors(items);
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAuthors(); }, [fetchAuthors]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a: Author) => {
    setEditing(a);
    setForm({ name: a.name, slug: a.slug, jobTitle: a.jobTitle || '', bio: a.bio || '', avatarUrl: a.avatarUrl || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const body = { name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), jobTitle: form.jobTitle, bio: form.bio, avatarUrl: form.avatarUrl };
      const url = editing ? `${API}/api/authors/${editing._id}` : `${API}/api/authors`;
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: getHeaders(), body: JSON.stringify(body) });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || 'Lưu thất bại'); }
      setShowModal(false);
      fetchAuthors();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi kết nối'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/authors/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || 'Xóa thất bại'); }
      setDeleteId('');
      fetchAuthors();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi kết nối'); }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tác giả</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý tác giả bài viết</p>
        </div>
        <button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Thêm tác giả
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Đang tải...</div>
        ) : authors.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Chưa có tác giả nào</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Tác giả', 'Chức danh', 'Slug', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {authors.map(author => (
                <tr key={author._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {author.avatarUrl ? (
                        <img src={author.avatarUrl} alt={author.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs flex-shrink-0">
                          {author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{author.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{author.jobTitle || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{author.slug}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(author)} className="text-slate-600 hover:text-emerald-600 text-xs font-medium">Sửa</button>
                    <button onClick={() => setDeleteId(author._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-slate-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-slate-500 mb-4">Bạn có chắc muốn xóa tác giả này không?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId('')} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Hủy</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-slate-800 mb-4">{editing ? 'Sửa tác giả' : 'Thêm tác giả'}</h3>
            <div className="space-y-3">
              {[['name', 'Tên tác giả *'], ['slug', 'Slug'], ['jobTitle', 'Chức danh'], ['avatarUrl', 'URL ảnh đại diện']].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input value={(form as Record<string, string>)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tiểu sử</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

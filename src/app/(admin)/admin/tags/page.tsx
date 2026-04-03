'use client';
import { API } from '@/lib/api';

import { useState, useEffect, useCallback } from 'react';


interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  isActive: boolean;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  };
}

const emptyForm = { name: '', slug: '', color: '#10b981' };

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/tags`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data ?? []);
      setTags(items);
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (tag: Tag) => {
    setEditing(tag);
    setForm({ name: tag.name, slug: tag.slug, color: tag.color || '#10b981' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const body = { name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), color: form.color };
      const url = editing ? `${API}/api/tags/${editing.id}` : `${API}/api/tags`;
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: getHeaders(), body: JSON.stringify(body) });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || 'Lưu thất bại'); }
      setShowModal(false);
      fetchTags();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi kết nối'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/tags/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || 'Xóa thất bại'); }
      setDeleteId('');
      fetchTags();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi kết nối'); }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tags</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý nhãn bài viết</p>
        </div>
        <button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Thêm tag
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Đang tải...</div>
        ) : tags.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Chưa có tag nào</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Tag', 'Slug', 'Trạng thái', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tags.map(tag => (
                <tr key={tag.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color || '#10b981' }} />
                      <span className="font-medium text-slate-800">{tag.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{tag.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tag.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {tag.isActive ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(tag)} className="text-slate-600 hover:text-emerald-600 text-xs font-medium">Sửa</button>
                    <button onClick={() => setDeleteId(tag.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Xóa</button>
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
            <p className="text-sm text-slate-500 mb-4">Bạn có chắc muốn xóa tag này không?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId('')} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Hủy</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-slate-800 mb-4">{editing ? 'Sửa tag' : 'Thêm tag'}</h3>
            <div className="space-y-3">
              {[['name', 'Tên tag *'], ['slug', 'Slug']].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input value={(form as Record<string, string>)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Màu sắc</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-10 h-9 rounded border border-slate-200 cursor-pointer" />
                  <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
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

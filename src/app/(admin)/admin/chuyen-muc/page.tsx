'use client';
import { API } from '@/lib/api';

import { useState, useEffect, useCallback } from 'react';


interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder?: number;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  };
}

const emptyForm = { name: '', slug: '', description: '', parentId: '', sortOrder: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/categories`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data ?? []);
      setCategories(items);
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', parentId: cat.parentId || '', sortOrder: cat.sortOrder || 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const body = { name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), description: form.description, ...(form.parentId && { parentId: form.parentId }), sortOrder: form.sortOrder };
      const url = editing ? `${API}/api/categories/${editing._id}` : `${API}/api/categories`;
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: getHeaders(), body: JSON.stringify(body) });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || 'Lưu thất bại'); }
      setShowModal(false);
      fetchCategories();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi kết nối'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/categories/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || 'Xóa thất bại'); }
      setDeleteId('');
      fetchCategories();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi kết nối'); }
  };

  const parentName = (id?: string) => id ? (categories.find(c => c._id === id)?.name || id) : '—';

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Chuyên mục</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh mục bài viết</p>
        </div>
        <button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Thêm chuyên mục
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Chưa có chuyên mục nào</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Tên', 'Slug', 'Danh mục cha', 'Thứ tự', 'Trạng thái', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => (
                <tr key={cat._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-slate-500">{parentName(cat.parentId)}</td>
                  <td className="px-4 py-3 text-slate-500">{cat.sortOrder ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {cat.isActive ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(cat)} className="text-slate-600 hover:text-emerald-600 text-xs font-medium">Sửa</button>
                    <button onClick={() => setDeleteId(cat._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-slate-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-slate-500 mb-4">Bạn có chắc muốn xóa chuyên mục này không?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId('')} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Hủy</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-slate-800 mb-4">{editing ? 'Sửa chuyên mục' : 'Thêm chuyên mục'}</h3>
            <div className="space-y-3">
              {[['name', 'Tên chuyên mục *'], ['slug', 'Slug'], ['description', 'Mô tả']].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input value={(form as Record<string, string | number>)[k] as string} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Danh mục cha</label>
                <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">— Không có —</option>
                  {categories.filter(c => c._id !== editing?._id).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Thứ tự</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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

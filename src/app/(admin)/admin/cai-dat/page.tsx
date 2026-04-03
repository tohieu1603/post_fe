'use client';
import { API } from '@/lib/api';

import { useState, useEffect, useCallback } from 'react';


interface Settings {
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string;
  contactEmail?: string;
  [key: string]: string | undefined;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [form, setForm] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/settings`, { headers: getHeaders() });
      if (!res.ok) { setUnavailable(true); return; }
      const json = await res.json();
      // API returns { site: { siteName, siteDescription, logoUrl }, email: { contactEmail }, seo: {...}, general: {...} }
      const site = json.site || {};
      const email = json.email || {};
      const normalized: Settings = {
        siteName: site.siteName || '',
        siteDescription: site.siteDescription || '',
        logoUrl: site.logoUrl || '',
        contactEmail: email.contactEmail || '',
      };
      setSettings(normalized);
      setForm({ ...normalized });
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const merged = { ...settings, ...form };
      const settingsPayload = [
        { key: 'site.siteName', value: merged.siteName || '' },
        { key: 'site.siteDescription', value: merged.siteDescription || '' },
        { key: 'site.logoUrl', value: merged.logoUrl || '' },
        { key: 'email.contactEmail', value: merged.contactEmail || '' },
      ];
      const res = await fetch(`${API}/api/settings/bulk`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ settings: settingsPayload }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || 'Lưu thất bại'); }
      setSuccess('Đã lưu cài đặt thành công');
      fetchSettings();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi kết nối'); } finally { setSaving(false); }
  };

  if (unavailable) {
    return (
      <div className="p-6 bg-slate-50 min-h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Cài đặt</h2>
          <p className="text-slate-500 text-sm">Chức năng cài đặt đang được phát triển</p>
          <p className="text-slate-400 text-xs mt-2">API chưa sẵn sàng</p>
        </div>
      </div>
    );
  }

  const fields: [keyof Settings, string, string][] = [
    ['siteName', 'Tên website', 'text'],
    ['siteDescription', 'Mô tả website', 'text'],
    ['logoUrl', 'URL logo', 'text'],
    ['contactEmail', 'Email liên hệ', 'email'],
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt</h1>
        <p className="text-sm text-slate-500 mt-1">Cấu hình thông tin website</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">{success}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        {loading ? (
          <div className="py-8 text-center text-slate-400">Đang tải...</div>
        ) : (
          <>
            <div className="space-y-4">
              {fields.map(([key, label, type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key] || ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={label}
                  />
                </div>
              ))}
            </div>

            {form.logoUrl && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">Xem trước logo:</p>
                <img src={form.logoUrl} alt="Logo preview" className="h-12 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

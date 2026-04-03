'use client';
import { API } from '@/lib/api';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';


// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

interface AuthorOption {
  _id: string;
  name: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

export interface PostFormData {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  categoryId: string;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  tags: string[];
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  readingTime: number;
  faq: FaqItem[];
}

export interface AdminPostFormProps {
  mode: 'create' | 'edit';
  postId?: string;
  initialData?: Partial<PostFormData>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{children}</label>;
}

type InputFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

function InputField({
  value,
  onChange,
  placeholder,
  className = '',
  type = 'text',
  ...rest
}: InputFieldProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${className}`}
      {...rest}
    />
  );
}

function TextAreaField({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-y ${className}`}
    />
  );
}

function Card({ title, children, collapsible = false }: { title: string; children: React.ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div
        className={`flex items-center justify-between px-5 py-4 border-b border-slate-100 ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
      >
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {collapsible && (
          <span className={`material-symbols-outlined text-slate-400 text-lg transition-transform ${open ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        )}
      </div>
      {open && <div className="px-5 py-4 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Tags Input ───────────────────────────────────────────────────────────────

function TagsInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-emerald-400 hover:text-emerald-700 transition-colors leading-none"
              aria-label={`Xóa tag ${tag}`}
            >
              <span className="material-symbols-outlined text-sm leading-none">close</span>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Nhập tag rồi nhấn Enter..."
          className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-all"
        >
          Thêm
        </button>
      </div>
    </div>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────

function FaqSection({ faq, onChange }: { faq: FaqItem[]; onChange: (faq: FaqItem[]) => void }) {
  function addItem() {
    onChange([...faq, { question: '', answer: '' }]);
  }

  function updateItem(index: number, field: 'question' | 'answer', value: string) {
    const updated = faq.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange(updated);
  }

  function removeItem(index: number) {
    onChange(faq.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {faq.map((item, index) => (
        <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">FAQ #{index + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-rose-400 hover:text-rose-600 transition-colors"
              aria-label="Xóa FAQ"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
          <div>
            <Label>Câu hỏi</Label>
            <InputField
              value={item.question}
              onChange={(v) => updateItem(index, 'question', v)}
              placeholder="Nhập câu hỏi..."
            />
          </div>
          <div>
            <Label>Câu trả lời</Label>
            <TextAreaField
              value={item.answer}
              onChange={(v) => updateItem(index, 'answer', v)}
              placeholder="Nhập câu trả lời..."
              rows={3}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 text-sm font-medium transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Thêm câu hỏi FAQ
      </button>
    </div>
  );
}

// ─── Cover Image Section ──────────────────────────────────────────────────────

function CoverImageSection({
  postId,
  coverImage,
  onChange,
  mode,
}: {
  postId?: string;
  coverImage: string;
  onChange: (url: string) => void;
  mode: 'create' | 'edit';
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    if (!postId) {
      setUploadError('Lưu bài viết trước khi tải ảnh lên.');
      return;
    }
    const token = getToken();
    setUploading(true);
    setUploadError('');
    try {
      const form = new FormData();
      form.append('cover', file);
      const res = await fetch(`${API}/api/posts/${postId}/cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error(`Upload thất bại (${res.status})`);
      const json = await res.json();
      const url = json?.coverImage || json?.url || json?.data?.coverImage || '';
      if (url) onChange(url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!postId) {
      onChange('');
      return;
    }
    const token = getToken();
    try {
      await fetch(`${API}/api/posts/${postId}/cover`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onChange('');
    } catch {
      onChange('');
    }
  }

  return (
    <div className="space-y-3">
      {coverImage && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200">
          <Image src={coverImage} alt="Cover" width={800} height={400} className="w-full h-40 object-cover" unoptimized={coverImage.startsWith('http://') || coverImage.startsWith('blob:')} />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow text-rose-500 hover:text-rose-700 transition-all"
            aria-label="Xóa ảnh bìa"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      )}
      <div>
        <Label>URL ảnh bìa</Label>
        <InputField
          value={coverImage}
          onChange={onChange}
          placeholder="https://..."
          type="url"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">upload</span>
          {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
        </button>
        {mode === 'create' && (
          <span className="text-xs text-slate-400">(Lưu bài trước để tải ảnh)</span>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
        />
      </div>
      {uploadError && (
        <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
      )}
    </div>
  );
}

// ─── Main Form Component ───────────────────────────────────────────────────────

const EMPTY_FORM: PostFormData = {
  title: '',
  slug: '',
  subtitle: '',
  excerpt: '',
  content: '',
  categoryId: '',
  authorId: '',
  status: 'draft',
  isFeatured: false,
  tags: [],
  coverImage: '',
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  readingTime: 1,
  faq: [],
};

export default function AdminPostForm({ mode, postId, initialData }: AdminPostFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<PostFormData>({ ...EMPTY_FORM, ...initialData });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [slugGenerating, setSlugGenerating] = useState(false);

  // Saved postId (for cover upload in create mode after first save)
  const [savedPostId, setSavedPostId] = useState<string | undefined>(postId);

  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch categories + authors ──────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/dang-nhap');
      return;
    }

    async function loadOptions() {
      try {
        const [catRes, authRes] = await Promise.all([
          fetch(`${API}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/authors`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const catJson = await catRes.json();
        const authJson = await authRes.json();
        setCategories(catJson?.data ?? []);
        setAuthors(authJson?.data ?? []);
      } catch {
        // non-blocking
      }
    }

    loadOptions();
  }, [router]);

  // ── Fetch post data for edit mode ──────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'edit' || !postId) return;
    const token = getToken();

    async function loadPost() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Lỗi tải bài viết (${res.status})`);
        const json = await res.json();
        const p = json?.data ?? json;

        setForm({
          title: p.title ?? '',
          slug: p.slug ?? '',
          subtitle: p.subtitle ?? '',
          excerpt: p.excerpt ?? '',
          content: p.content ?? '',
          categoryId: p.category?._id ?? p.categoryId ?? '',
          authorId: p.authorInfo?._id ?? p.authorId ?? p.author ?? '',
          status: p.status ?? 'draft',
          isFeatured: p.isFeatured ?? false,
          tags: Array.isArray(p.tags) ? p.tags : [],
          coverImage: p.coverImage ?? '',
          metaTitle: p.metaTitle ?? '',
          metaDescription: p.metaDescription ?? '',
          canonicalUrl: p.canonicalUrl ?? '',
          readingTime: p.readingTime ?? calcReadingTime(p.content ?? ''),
          faq: Array.isArray(p.faq)
            ? p.faq.map((f: { question?: string; answer?: string }) => ({ question: f.question ?? '', answer: f.answer ?? '' }))
            : [],
        });
      } catch (e) {
        setFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Lỗi tải dữ liệu' });
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [mode, postId]);

  // ── Auto slug from title ───────────────────────────────────────────────────
  const generateSlug = useCallback(async (title: string) => {
    if (!title.trim()) return;
    const token = getToken();
    setSlugGenerating(true);
    try {
      const res = await fetch(`${API}/api/posts/generate-slug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.slug) {
          setForm((prev) => ({ ...prev, slug: json.slug }));
        }
      }
    } catch {
      // ignore
    } finally {
      setSlugGenerating(false);
    }
  }, []);

  function handleTitleChange(value: string) {
    setForm((prev) => ({ ...prev, title: value }));
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    slugDebounceRef.current = setTimeout(() => generateSlug(value), 500);
  }

  // ── Content change → reading time ─────────────────────────────────────────
  function handleContentChange(value: string) {
    setForm((prev) => ({
      ...prev,
      content: value,
      readingTime: calcReadingTime(value),
    }));
  }

  // ── Field update helper ────────────────────────────────────────────────────
  function update<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function save(targetStatus?: 'draft' | 'published') {
    const token = getToken();
    if (!token) {
      router.replace('/dang-nhap');
      return;
    }

    const payload: Partial<PostFormData> & { status: string } = {
      ...form,
      status: targetStatus ?? form.status,
    };

    // Remove empty strings for optional fields
    if (!payload.categoryId) delete payload.categoryId;
    if (!payload.authorId) delete payload.authorId;

    setSaving(true);
    setFeedback(null);

    try {
      let url: string;
      let method: string;

      if (mode === 'create') {
        url = `${API}/api/posts`;
        method = 'POST';
      } else {
        url = `${API}/api/posts/${postId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message || `Lỗi ${res.status}`);
      }

      const json = await res.json();
      const newId = json?.data?._id ?? json?._id ?? savedPostId;
      if (newId) setSavedPostId(newId);

      setFeedback({ type: 'success', msg: mode === 'create' ? 'Tạo bài viết thành công!' : 'Lưu thành công!' });

      setTimeout(() => {
        router.push('/admin/bai-viet');
      }, 800);
    } catch (e) {
      setFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Có lỗi xảy ra' });
    } finally {
      setSaving(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6 pb-24">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/bai-viet"
          className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Danh sách bài viết
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-lg font-bold text-slate-900">
          {mode === 'create' ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết'}
        </h1>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {feedback.msg}
        </div>
      )}

      {/* 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Left: main content ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Basic info */}
          <Card title="Thông tin cơ bản">
            {/* Title */}
            <div>
              <Label>Tiêu đề *</Label>
              <InputField
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Nhập tiêu đề bài viết..."
                className="text-base font-semibold"
              />
            </div>

            {/* Slug */}
            <div>
              <Label>Slug (đường dẫn)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <InputField
                    value={form.slug}
                    onChange={(v) => update('slug', v)}
                    placeholder="tieu-de-bai-viet"
                    className={slugGenerating ? 'opacity-60' : ''}
                  />
                  {slugGenerating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => generateSlug(form.title)}
                  disabled={slugGenerating || !form.title}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-all disabled:opacity-40 flex items-center gap-1.5"
                  title="Tạo lại slug"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  Tạo lại
                </button>
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <Label>Mô tả phụ (tùy chọn)</Label>
              <InputField
                value={form.subtitle}
                onChange={(v) => update('subtitle', v)}
                placeholder="Mô tả ngắn hiển thị dưới tiêu đề..."
              />
            </div>
          </Card>

          {/* Content */}
          <Card title="Nội dung bài viết">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Nội dung (Markdown)</Label>
                <span className="text-xs text-slate-400">
                  {form.content.trim().split(/\s+/).filter(Boolean).length} từ · {form.readingTime} phút đọc
                </span>
              </div>
              <textarea
                value={form.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="# Tiêu đề&#10;&#10;Viết nội dung bài viết bằng Markdown..."
                rows={22}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-y font-mono leading-relaxed"
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label>Tóm tắt (excerpt)</Label>
              <TextAreaField
                value={form.excerpt}
                onChange={(v) => update('excerpt', v)}
                placeholder="Mô tả ngắn về bài viết, hiển thị trong danh sách và mạng xã hội..."
                rows={3}
              />
            </div>

            {/* Reading time */}
            <div className="w-40">
              <Label>Thời gian đọc (phút)</Label>
              <InputField
                value={String(form.readingTime)}
                onChange={(v) => update('readingTime', Math.max(1, parseInt(v) || 1))}
                type="number"
                min="1"
                max="120"
              />
            </div>
          </Card>

          {/* SEO */}
          <Card title="SEO" collapsible>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Meta Title</Label>
                <span className={`text-xs font-medium ${form.metaTitle.length > 70 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {form.metaTitle.length}/70
                </span>
              </div>
              <InputField
                value={form.metaTitle}
                onChange={(v) => update('metaTitle', v)}
                placeholder="Tiêu đề SEO (để trống dùng tiêu đề bài viết)"
                maxLength={70}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Meta Description</Label>
                <span className={`text-xs font-medium ${form.metaDescription.length > 160 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {form.metaDescription.length}/160
                </span>
              </div>
              <TextAreaField
                value={form.metaDescription}
                onChange={(v) => update('metaDescription', v)}
                placeholder="Mô tả SEO (để trống dùng excerpt)"
                rows={3}
              />
            </div>

            <div>
              <Label>Canonical URL</Label>
              <InputField
                value={form.canonicalUrl}
                onChange={(v) => update('canonicalUrl', v)}
                placeholder="https://aivietnam.vn/bai-viet/..."
                type="url"
              />
            </div>
          </Card>

          {/* FAQ */}
          <Card title="Câu hỏi thường gặp (FAQ)" collapsible>
            <FaqSection faq={form.faq} onChange={(v) => update('faq', v)} />
          </Card>
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────────── */}
        <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 space-y-5">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Hành động</h3>
            <button
              type="button"
              onClick={() => save('draft')}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all disabled:opacity-50 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              {saving ? 'Đang lưu...' : 'Lưu nháp'}
            </button>
            <button
              type="button"
              onClick={() => save('published')}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all disabled:opacity-50 active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">publish</span>
              {saving ? 'Đang lưu...' : 'Xuất bản'}
            </button>
            <Link
              href="/admin/bai-viet"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm font-medium transition-all"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Quay lại danh sách
            </Link>
          </div>

          {/* Status */}
          <Card title="Trạng thái">
            <div className="space-y-2">
              {(['draft', 'published', 'archived'] as const).map((s) => {
                const labels = { draft: 'Bản nháp', published: 'Đã xuất bản', archived: 'Lưu trữ' };
                const icons = { draft: 'edit_note', published: 'check_circle', archived: 'archive' };
                const colors = {
                  draft: form.status === s ? 'border-slate-400 bg-slate-50 text-slate-700' : 'border-slate-200 text-slate-500',
                  published: form.status === s ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500',
                  archived: form.status === s ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500',
                };
                return (
                  <label
                    key={s}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border cursor-pointer transition-all ${colors[s]}`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => update('status', s)}
                      className="accent-emerald-600"
                    />
                    <span className="material-symbols-outlined text-lg">{icons[s]}</span>
                    <span className="text-sm font-medium">{labels[s]}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Category */}
          <Card title="Chuyên mục">
            <select
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            >
              <option value="">-- Chọn chuyên mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Card>

          {/* Author */}
          <Card title="Tác giả">
            <select
              value={form.authorId}
              onChange={(e) => update('authorId', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            >
              <option value="">-- Chọn tác giả --</option>
              {authors.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Card>

          {/* Tags */}
          <Card title="Tags">
            <TagsInput tags={form.tags} onChange={(v) => update('tags', v)} />
          </Card>

          {/* Featured */}
          <Card title="Tùy chọn">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-emerald-500' : 'bg-slate-300'}`}
                onClick={() => update('isFeatured', !form.isFeatured)}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </div>
              <span className="text-sm font-medium text-slate-700">Bài viết nổi bật</span>
            </label>
          </Card>

          {/* Cover image */}
          <Card title="Ảnh bìa">
            <CoverImageSection
              postId={savedPostId}
              coverImage={form.coverImage}
              onChange={(v) => update('coverImage', v)}
              mode={mode}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

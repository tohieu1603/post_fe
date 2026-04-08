export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  publishedAt: string | null;
  viewCount: number;
  readingTime: number | null;
  wordCount: number | null;
  author: string | null;
  authorId: string | null;
  authorInfo: Author | null;
  category: { _id: string; name: string; slug: string } | null;
  tags: string[] | null;
  faq: FaqItem[] | null;
  contentBlocks: ContentBlock[] | null;
  contentStructure: { toc: TocItem[]; wordCount: number; readingTime: number } | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  isBreaking: boolean;
  articleType: string;
  template: string | null;
  extras: any;
  language: string;
  imageAlt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
  subcategoryCount?: number;
  children?: Category[];
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  bio: string | null;
  jobTitle: string | null;
  expertise: string[];
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  github: string | null;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
  color?: string;
  postCount?: number;
}

export interface FaqItem {
  _id?: string;
  question: string;
  answer: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
  anchor: string;
}

export interface ContentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'list' | 'code' | 'quote' | 'divider' | 'table' | 'faq' | 'media-text';
  level?: number;
  text?: string;
  anchor?: string;
  url?: string;
  alt?: string;
  caption?: string;
  style?: 'ordered' | 'unordered';
  items?: string[];
  language?: string;
  code?: string;
  headers?: string[];
  rows?: string[][];
  question?: string;
  answer?: string;
  imageUrl?: string;
  imageAlt?: string;
  title?: string;
  mediaPosition?: 'left' | 'right';
  mediaWidth?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  og: { type: string; title: string; description: string; image: string; url: string };
  breadcrumbs: { name: string; url: string }[];
}

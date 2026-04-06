export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import StaticCategoryPage from '@/components/static-category-page';

export const metadata: Metadata = {
  title: 'So Sánh - AI Vietnam',
  description: 'Bài so sánh chuyên sâu về AI, công cụ, nền tảng',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function SoSanhPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp?.page ?? 1);

  return (
    <StaticCategoryPage
      slug="so-sanh"
      title="So Sánh"
      description="Bài so sánh chuyên sâu về AI, công cụ, nền tảng"
      icon="compare"
      page={page}
    />
  );
}

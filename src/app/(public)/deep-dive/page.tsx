export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import StaticCategoryPage from '@/components/static-category-page';

export const metadata: Metadata = {
  title: 'Deep Dive - AI Vietnam',
  description: 'Nghiên cứu kỹ thuật chuyên sâu',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DeepDivePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp?.page ?? 1);

  return (
    <StaticCategoryPage
      slug="deep-dive"
      title="Deep Dive"
      description="Nghiên cứu kỹ thuật chuyên sâu"
      icon="science"
      page={page}
    />
  );
}

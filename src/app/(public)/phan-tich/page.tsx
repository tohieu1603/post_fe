export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import StaticCategoryPage from '@/components/static-category-page';

export const metadata: Metadata = {
  title: 'Phân Tích - AI Vietnam',
  description: 'Phân tích thị trường, xu hướng AI',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PhanTichPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp?.page ?? 1);

  return (
    <StaticCategoryPage
      slug="phan-tich"
      title="Phân Tích"
      description="Phân tích thị trường, xu hướng AI"
      icon="analytics"
      page={page}
    />
  );
}

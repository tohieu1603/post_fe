export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import StaticCategoryPage from '@/components/static-category-page';

export const metadata: Metadata = {
  title: 'Hướng Dẫn - AI Vietnam',
  description: 'Tutorial, hướng dẫn sử dụng AI và công nghệ',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HuongDanPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp?.page ?? 1);

  return (
    <StaticCategoryPage
      slug="huong-dan"
      title="Hướng Dẫn"
      description="Tutorial, hướng dẫn sử dụng AI và công nghệ"
      icon="menu_book"
      page={page}
    />
  );
}

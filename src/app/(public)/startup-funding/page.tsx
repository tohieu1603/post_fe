export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import StaticCategoryPage from '@/components/static-category-page';

export const metadata: Metadata = {
  title: 'Startup & Funding - AI Vietnam',
  description: 'Tin tức startup, gọi vốn, đầu tư công nghệ',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function StartupFundingPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp?.page ?? 1);

  return (
    <StaticCategoryPage
      slug="startup-funding"
      title="Startup & Funding"
      description="Tin tức startup, gọi vốn, đầu tư công nghệ"
      icon="rocket_launch"
      page={page}
    />
  );
}

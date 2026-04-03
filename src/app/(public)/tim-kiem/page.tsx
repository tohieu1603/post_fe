import type { Metadata } from 'next';
import { Suspense } from 'react';
import { searchPosts, getMostViewed } from '@/lib/api';
import { SearchResultsClient } from './search-results-client';

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp?.q ?? '';
  return {
    title: q ? `Kết quả tìm kiếm cho "${q}" - AI Vietnam` : 'Tìm kiếm - AI Vietnam',
    description: q
      ? `Tìm thấy các bài viết về "${q}" trên AI Vietnam.`
      : 'Tìm kiếm bài viết trên AI Vietnam.',
    robots: 'noindex, follow',
  };
}

export default async function SearchResultsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp?.q ?? '';
  const page = Number(sp?.page ?? 1);
  const LIMIT = 10;

  const [searchRes, mostViewedRes] = await Promise.allSettled([
    q ? searchPosts(q, LIMIT, page) : Promise.resolve(null),
    getMostViewed(5),
  ]);

  const searchData =
    searchRes.status === 'fulfilled' && searchRes.value
      ? searchRes.value.data
      : null;

  const mostViewed =
    mostViewedRes.status === 'fulfilled' ? mostViewedRes.value.data : [];

  return (
    <>
      <Suspense>
        <SearchResultsClient
          initialQuery={q}
          initialPage={page}
          posts={searchData?.posts ?? []}
          pagination={searchData?.pagination ?? null}
          mostViewed={mostViewed}
        />
      </Suspense>
    </>
  );
}

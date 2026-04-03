'use client';

import { use } from 'react';
import AdminPostForm from '@/components/admin-post-form';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminPostForm mode="edit" postId={id} />;
}

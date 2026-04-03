'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/api';

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Track page view once on mount
    trackEvent({ eventType: 'view', entityType: 'post', entitySlug: slug }).catch(() => {
      // silently ignore tracking errors
    });
  }, [slug]);

  return null;
}

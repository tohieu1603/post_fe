/** Format date in Vietnamese: "1 tháng 4, 2026" */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Relative time: "2 giờ trước", "3 ngày trước" */
export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(dateStr);
}

/** Reading time display */
export function readingTimeText(minutes: number | null): string {
  if (!minutes) return '';
  return `${minutes} phút đọc`;
}

/** Truncate text with ellipsis */
export function truncate(text: string | null, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '...';
}

# Homepage Redesign — VnExpress Style

## Goal
Redesign homepage from sparse blog layout to dense news portal (VnExpress-inspired) while keeping AI Vietnam brand (emerald/green, Inter font, Material Design 3 tokens).

## Design Analysis

### Current Screenshot Reference
- **Hero**: Large featured card (left 7 cols) + 3 side cards (right 5 cols)
- **Tin mới nhất**: 4-col card grid with thumbnails
- **Newsletter**: Green gradient CTA
- **Xu hướng**: Numbered trending list + sidebar widgets
- **Footer**: Dark emerald with columns

### VnExpress Additions Needed
- Denser layout — more posts visible
- Category sections with "Xem tất cả" links
- Sidebar "Xem nhiều nhất" (numbered list)
- Horizontal post lists (image left + content right)
- Multiple category blocks
- "Tuần qua" section
- More visual hierarchy

## Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 01 | Implement new homepage layout | pending |
| 02 | Create 5 static pages | pending |
| 03 | Build & verify | pending |

## Tech Stack
- Next.js 16, Tailwind CSS v4, Server Components
- APIs: getFeatured, getLatest, getHomeSections, getMostViewed, getTrendingTags, getWeeklyDigest

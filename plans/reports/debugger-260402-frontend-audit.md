# Frontend Audit Report — post_fe_public
**Date:** 2026-04-02  
**Auditor:** Static source-code analysis (no runtime execution)  
**Scope:** All 18 pages + shared components

---

## Executive Summary

18 pages scanned. Found **37 issues** across all severity levels.

| Severity | Count |
|---|---|
| Critical | 9 |
| Important | 17 |
| Minor | 11 |

**Key themes:**
- Bookmarks, AI Chat, Buy Tokens, and profile pages rely on **hardcoded data** with no real API integration
- Comment system on article detail is **pure UI mockup** — no backend connection
- Social login buttons (Google, Facebook) throughout auth pages are **non-functional**
- `ShareButtons` component has a mislabeled "Tóm tắt AI" button that links to Facebook
- `getAuthorPosts()` returns **all latest posts** regardless of author — broken filter
- Admin pages have **several sidebar nav links pointing to `#`** (dead links)
- Newsletter/email subscription forms across the site are **not wired to any API**
- `AskAiCta` and chat FABs on public pages go **nowhere**
- "Đổi mật khẩu" on profile page explicitly shows a fake success message with no API call
- Token balance is hardcoded to **150** everywhere — not fetched from backend

---

## Issues by Page

---

### 1. `/` — Homepage (`(public)/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 1.1 | Chat FAB (`fixed bottom-8 right-8`) is a plain `<button>` with no `onClick` — clicking does nothing | Important | Wire to open `/ai-chat` or trigger the AI chat widget |
| 1.2 | "Xem tất cả" on "Tin mới nhất" section links to `/chuyen-muc/tin-nhanh` — this slug may not exist in the database | Minor | Use a dynamic slug from API or remove the link |
| 1.3 | Tags in `TrendingTagsWidget` link to `/tag/${tag.slug}` — the `/tag/[slug]` route **does not exist** in the app | Critical | Create route or change links to `/tim-kiem?q=...` |
| 1.4 | Newsletter section uses `<NewsletterForm />` which has no API call — submits and shows success locally only | Important | Wire to real email subscription API |

---

### 2. `/bai-viet/{slug}` — Article Detail (`(public)/bai-viet/[slug]/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 2.1 | Comment section is **entirely hardcoded** — two fake comments ("Nguyễn Thành Nam", "Trần Thùy Linh") displayed as real data | Critical | Fetch real comments from API or clearly mark as "Bình luận đang phát triển" |
| 2.2 | "Gửi bình luận" button and textarea have **no state, no handler, no API call** — submitting does nothing | Critical | Implement comment submission or disable the form visually |
| 2.3 | "Thích" and "Trả lời" buttons on comments have **no handlers** — clicking does nothing | Important | Implement or remove |
| 2.4 | "Theo dõi" button on author box has no `onClick` handler — does nothing | Important | Implement follow functionality or remove |
| 2.5 | `ShareButtons` component: "Tóm tắt AI" button uses a `smart_toy` icon but the underlying `<a>` tag is an **actual Facebook share link** — mislabeled/wrong functionality | Important | Separate the "AI Summary" action from the Facebook share link |
| 2.6 | Bookmark button in `ShareButtons` only toggles local state — does **not** save to any API or localStorage | Important | Connect to bookmarks API or localStorage persistence |
| 2.7 | Sidebar newsletter card "Đăng ký ngay" has no form state or API connection — button click does nothing | Minor | Wire to same `NewsletterForm` component or add handler |
| 2.8 | "Sắp xếp: Mới nhất" dropdown on comments section is static text with expand icon but no `onClick` — non-functional | Minor | Implement or remove the dropdown indicator |

---

### 3. `/chuyen-muc/{slug}` — Category Listing (`(public)/chuyen-muc/[slug]/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 3.1 | `AskAiCta` sidebar button ("Đặt câu hỏi cho AI trợ lý") is a `<button>` with no `onClick` — clicking does nothing | Important | Link to `/ai-chat` or wire to chat widget |
| 3.2 | Chat FAB tooltip "Chat ngay" button has no `onClick` — does nothing | Minor | Link to `/ai-chat` |
| 3.3 | Tags in `TagsWidget` link to `/tag/${tag.slug}` — `/tag/[slug]` route **does not exist** | Critical | Same as issue 1.3 |

---

### 4. `/tim-kiem` — Search (`(public)/tim-kiem/page.tsx` + `search-results-client.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 4.1 | "HỎI AI NGAY" button in sidebar has no `onClick` — clicking does nothing | Important | Link to `/ai-chat` with pre-filled query |
| 4.2 | "Đăng ký" newsletter button in sidebar has no `onSubmit` or `onClick` handler — does nothing | Minor | Wire to newsletter API |

---

### 5. `/dang-nhap` — Login (`(auth)/dang-nhap/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 5.1 | "Đăng nhập bằng Google" button has `type="button"` but no `onClick` — non-functional | Important | Implement OAuth or remove; do not show a fake button |
| 5.2 | "Đăng nhập bằng Facebook" button has `type="button"` but no `onClick` — non-functional | Important | Same as 5.1 |
| 5.3 | "Điều khoản" and "Bảo mật" links in footer point to `href="#"` — dead links | Minor | Link to `/chinh-sach-bao-mat` etc. |
| 5.4 | "Ghi nhớ đăng nhập" checkbox (`rememberMe` state) is captured but **never used** — token is always stored in `localStorage` regardless | Minor | Implement: if unchecked, use `sessionStorage` instead |

---

### 6. `/dang-ky` — Register (`(auth)/dang-ky/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 6.1 | "Tiếp tục với Google" button — non-functional (no `onClick`) | Important | Implement OAuth or remove |
| 6.2 | "Tiếp tục với Facebook" button — non-functional (no `onClick`) | Important | Same as 6.1 |
| 6.3 | Nav links "Về chúng tôi", "Tính năng", "Tài liệu" point to `href="#"` — dead links | Minor | Link to actual pages or remove |
| 6.4 | "Điều khoản sử dụng" and "Chính sách bảo mật" links in terms checkbox point to `href="#"` — dead links | Important | Link to `/chinh-sach-bao-mat` etc. |
| 6.5 | After successful registration, redirects to `/dang-nhap?registered=1` but the login page has no handler for `?registered=1` parameter — success message never shown | Minor | Add success banner on login page when `?registered=1` is present |

---

### 7. `/quen-mat-khau` — Forgot Password (`(auth)/quen-mat-khau/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 7.1 | `handleSubmit` simulates a 800ms delay then shows success — **no API call is made at all** (comment in code: "Simulate network delay, no API yet") | Critical | Implement `POST /api/auth/forgot-password` or similar endpoint |
| 7.2 | "Điều khoản" and "Bảo mật" links in footer point to `href="#"` | Minor | Link to actual policy pages |

---

### 8. `/tai-khoan` — Profile (`(user)/tai-khoan/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 8.1 | "Lưu thay đổi" on profile form **only updates local React state** — no API call (`PUT /api/user/profile` or similar) | Critical | Implement profile update API call |
| 8.2 | "Đổi mật khẩu" form shows `"Đã cập nhật mật khẩu! (chức năng sẽ được kết nối API sớm)"` — explicitly a fake success, no API call | Critical | Implement `PUT /api/auth/change-password` |
| 8.3 | "Chỉnh sửa" button (profile header) has no `onClick` — does nothing (separate from the form save button) | Minor | Remove redundant button or scroll to form |
| 8.4 | Avatar "edit" button (`absolute bottom-0 right-0`) has no `onClick` — cannot upload photo | Minor | Implement avatar upload or remove button |
| 8.5 | Token count (`user.tokens ?? 150`) defaults to hardcoded `150` — not fetched from backend | Important | Fetch token balance from API on mount |
| 8.6 | "Lịch sử" tab links to `href="#"` — dead link | Minor | Implement history page or hide tab |
| 8.7 | Notifications bell button has no `onClick` — does nothing | Minor | Implement or remove |
| 8.8 | Footer links ("Privacy Policy", "Terms of Service", "Contact", "Ethics AI") all point to `href="#"` — dead links | Minor | Link to actual pages |
| 8.9 | Header uses custom hardcoded nav ("Latest", "Insights", "Tutorials", "Lab") — inconsistent with shared `<Header />` component used on public pages | Important | Use shared `<Header />` component for consistency |

---

### 9. `/tai-khoan/da-luu` — Bookmarks (`(user)/tai-khoan/da-luu/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 9.1 | Entire page renders **4 hardcoded SAMPLE_ARTICLES** — no API call to fetch real saved posts | Critical | Implement GET bookmarks API; replace `SAMPLE_ARTICLES` with real data |
| 9.2 | Category filter buttons ("Tất cả", "AI Tools", "Hướng dẫn") are hardcoded, non-functional — no filtering logic | Important | Implement filter logic once real data is loaded |
| 9.3 | "Xoá khỏi danh sách" delete button on hover has no `onClick` handler — clicking does nothing | Critical | Implement DELETE bookmark API call |
| 9.4 | "Tạo thư mục" button has no `onClick` — does nothing | Minor | Implement or remove |
| 9.5 | Search input in header has no `onSubmit`/`onChange` — non-functional | Important | Wire to `/tim-kiem` route |
| 9.6 | Notification bell badge always shows — notifications not loaded from API | Minor | Remove hardcoded badge or connect to API |
| 9.7 | Article cards are not `<Link>` — clicking an article card body navigates nowhere (only the card hover shows delete button) | Important | Wrap cards with `<Link href={...}>` to article detail |
| 9.8 | Header uses custom hardcoded nav (inconsistent with shared `<Header />`) | Important | Use shared `<Header />` component |
| 9.9 | Footer links ("Privacy Policy", "Terms of Service", "Contact") point to `href="#"` | Minor | Link to actual pages |

---

### 10. `/tai-khoan/nap-token` — Buy Tokens (`(user)/tai-khoan/nap-token/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 10.1 | "Thanh toán ngay" button has no `onClick` — clicking does nothing; no payment flow initiated | Critical | Implement payment integration (SePay, VNPay, MoMo, etc.) |
| 10.2 | Token balance shows hardcoded **"150 tokens"** — not fetched from backend | Important | Fetch from API on mount |
| 10.3 | Transaction history table shows **3 hardcoded fake rows** — not fetched from API | Important | Fetch real transaction history from API |
| 10.4 | "Xem tất cả" transaction history button has no `onClick`/`href` | Minor | Link to a full transaction history page or implement |
| 10.5 | Nav links "Discover", "Trending", "Library" point to hardcoded paths or `href="#"` inconsistent with rest of app | Minor | Use shared `<Header />` component |

---

### 11. `/ai-chat` — AI Chat (`(user)/ai-chat/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 11.1 | AI responses are **completely simulated** with a 1.2s `setTimeout` — no real API call to any AI backend | Critical | Implement `POST /api/ai/chat` or similar endpoint |
| 11.2 | Token count is hardcoded to **"150 tokens"** — not fetched from backend | Important | Fetch from API; decrement on each message |
| 11.3 | "1 token/câu hỏi" is displayed but tokens are never deducted — state inconsistency | Important | Connect to real token system |
| 11.4 | Conversation history sidebar only shows "Cuộc trò chuyện hiện tại" — hardcoded, no real chat history | Minor | Implement or remove the history sidebar |
| 11.5 | Mobile hamburger menu button (`md:hidden`) has no `onClick` to open sidebar — non-functional on mobile | Important | Implement mobile sidebar toggle |
| 11.6 | Share button in header has no `onClick` — does nothing | Minor | Implement share or remove |
| 11.7 | `let msgIdCounter = 2` is a module-level mutable variable — will cause subtle bugs with React StrictMode double-render and HMR | Minor | Move inside component or use `useRef` |

---

### 12. `/admin` — Admin Dashboard (`(admin)/admin/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 12.1 | Sidebar nav items "Chuyên mục", "Tags", "Tác giả", "Bình luận", "Users", "Doanh thu", "SEO", "Cài đặt" all link to `href="#"` — dead links | Important | Create pages or disable links until pages exist |
| 12.2 | "Doanh thu tháng" stat card shows **hardcoded "12.5M₫"** and "+23% tháng" — not fetched from API | Important | Fetch from revenue API or remove the card |
| 12.3 | Analytics charts ("Lượt xem 7 ngày", "Người dùng mới") are **hardcoded SVG/HTML** — not real data | Important | Fetch real analytics data or use a charting library |
| 12.4 | "Bar chart" `select` dropdown ("Tháng này" / "Tháng trước") has no `onChange` handler — does nothing | Minor | Wire to data filter or remove |
| 12.5 | Edit and Delete buttons on recent posts table have no `onClick` handlers | Important | Wire to edit page and delete API |
| 12.6 | Quick Actions: "Quản lý chuyên mục", "Duyệt bình luận", "Cài đặt hệ thống" all link to `href="#"` | Minor | Create pages or link properly |
| 12.7 | "XEM TẤT CẢ CHỨC NĂNG" button at bottom of quick actions has no `onClick` | Minor | Implement or remove |
| 12.8 | No role-based access check — any user with any token (not just admins) can access `/admin` | Critical | Check `user.role === 'admin'` from stored user object, redirect non-admins |
| 12.9 | Admin email in sidebar is hardcoded to `admin@aivietnam.vn` regardless of logged-in user | Minor | Use email from `localStorage.getItem('user')` |

---

### 13. `/admin/bai-viet` — Admin Posts (`(admin)/admin/bai-viet/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 13.1 | "Tạo bài mới" links to `/admin/bai-viet/moi` — this route **does not exist** in the app | Critical | Create the new-post page or disable button |
| 13.2 | Edit button (`edit` icon) on each post row has no `onClick` — does nothing | Important | Navigate to `/admin/bai-viet/[id]/edit` or similar |
| 13.3 | Bulk action buttons "Xuất bản", "Lưu trữ" are enabled when items selected but have no `onClick` handlers — clicking does nothing | Important | Implement bulk status update API calls |
| 13.4 | Sidebar nav items "Thành viên", "Bình luận", "Cài đặt" link to `href="#"` | Minor | Create pages or link properly |
| 13.5 | No role-based access check — same issue as 12.8 | Critical | Same fix as 12.8 |

---

### 14. `/gioi-thieu` — About (`(public)/gioi-thieu/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 14.1 | Team member data (names, roles, bios) is **hardcoded** — not fetched from API | Minor | Acceptable for static content; consider CMS-driven approach later |
| 14.2 | Stats ("500+ bài viết", "50K+ độc giả") are **hardcoded** — not real | Minor | Fetch from API or clearly mark as approximate |

No critical issues. Page loads correctly with Header + Footer.

---

### 15. `/lien-he` — Contact (`(public)/lien-he/page.tsx`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 15.1 | Contact form `handleSubmit` uses `setTimeout` to simulate submission — **no API call** | Important | Implement `POST /api/contact` or send via email API |
| 15.2 | Social links (Facebook, YouTube, Twitter, GitHub) in sidebar all point to `href="#"` | Minor | Add real social URLs or remove |
| 15.3 | Google Maps area is a **static placeholder div** — no real map embed | Minor | Embed real Google Maps iframe or remove |

---

### 16. `/chinh-sach-bien-tap` — Editorial Policy

No bugs. Static content page. Header + Footer present. All internal links valid.

---

### 17. `/dinh-chinh` — Corrections Policy

No bugs. Static content page. Header + Footer present. All internal links valid.

---

### 18. `/chinh-sach-bao-mat` — Privacy Policy

No bugs. Static content page. Header + Footer present. All internal links valid.

---

## Shared Component Issues

### `header.tsx`
| # | Issue | Severity | Fix |
|---|---|---|---|
| H.1 | Dark mode toggle button (`light_mode` icon) has no `onClick` — non-functional | Minor | Implement theme toggle or remove button |
| H.2 | `getNavMenu()` API is called client-side in `useEffect` — nav links have no loading state; FALLBACK_NAV slugs (`thoi-su`, `cong-nghe`, etc.) are hardcoded and likely don't match actual category slugs in DB | Minor | Ensure fallback slugs match actual DB slugs; add loading state |

### `footer.tsx`
| # | Issue | Severity | Fix |
|---|---|---|---|
| F.1 | Footer newsletter "Gửi" button has no `onSubmit`/`onClick` — pressing it does nothing | Important | Wire to newsletter API |
| F.2 | Social icons link to `href="#"` | Minor | Add real social URLs |
| F.3 | "Điều khoản sử dụng" and "Sitemap" links point to `href="#"` | Minor | Create pages or link to existing `/chinh-sach-bien-tap` |
| F.4 | Footer category links use `.toLowerCase().replace(/ /g, '-')` to generate slugs — produces incorrect slugs ("tin nhanh" → `tin-nhanh`, "ứng dụng ai" → `ứng-dụng-ai`) | Minor | Use actual slugs from DB/config |

### `newsletter-form.tsx`
| # | Issue | Severity | Fix |
|---|---|---|---|
| N.1 | `handleSubmit` only sets `submitted = true` in local state — **no API call at all** | Important | Implement newsletter subscription API call |

### `share-buttons.tsx`
| # | Issue | Severity | Fix |
|---|---|---|---|
| S.1 | "Tóm tắt AI" button (`smart_toy` icon) is actually an `<a>` href pointing to `facebook.com/sharer` — **wrong functionality, mislabeled** | Important | Separate AI summary action from Facebook share; create distinct buttons |

### `article-actions.tsx`
| # | Issue | Severity | Fix |
|---|---|---|---|
| A.1 | Bookmark toggle only changes local React state — not persisted; resets on page reload | Important | Persist to `localStorage` or API |
| A.2 | **Component is imported nowhere** — exists but unused in any page (`article-card.tsx` has its own inline version) | Minor | Integrate or remove dead code |

### `lib/api.ts`
| # | Issue | Severity | Fix |
|---|---|---|---|
| API.1 | `getAuthorPosts(authorId, limit)` ignores the `authorId` parameter — calls `/api/public/home/latest` returning **all latest posts**, not posts by that author | Critical | Call author-filtered endpoint (e.g., `/api/public/post?authorId=...`) when available; add TODO comment |
| API.2 | `login()` response type expects `{ user, accessToken, refreshToken }` but task description says backend returns `{ token, user }` — possible field name mismatch | Important | Verify against actual API response; update field names if needed |

---

## `/tac-gia/{slug}` — Author Profile (bonus page found in filesystem)

| # | Issue | Severity | Fix |
|---|---|---|---|
| T.1 | `getAuthorPosts()` returns wrong data (all latest posts, not author's posts) — see API.1 | Critical | Same fix as API.1 |
| T.2 | `getAuthorBySlug()` calls `/api/authors/slug/{slug}` — this endpoint path is **not prefixed with `/api/public/`** unlike all other public API calls; may require auth token | Important | Verify endpoint requires auth; if so, add token or use a proper public endpoint |

---

## Issue Count Summary by Page

| Page | Critical | Important | Minor |
|---|---|---|---|
| Homepage `/` | 1 | 2 | 1 |
| Article Detail | 2 | 4 | 2 |
| Category Listing | 1 | 1 | 1 |
| Search | 0 | 1 | 1 |
| Login | 0 | 2 | 2 |
| Register | 0 | 3 | 2 |
| Forgot Password | 1 | 0 | 1 |
| Profile | 2 | 3 | 4 |
| Bookmarks | 2 | 4 | 3 |
| Buy Tokens | 1 | 2 | 2 |
| AI Chat | 1 | 3 | 3 |
| Admin Dashboard | 2 | 4 | 3 |
| Admin Posts | 2 | 2 | 1 |
| About | 0 | 0 | 2 |
| Contact | 0 | 1 | 2 |
| Editorial Policy | 0 | 0 | 0 |
| Corrections | 0 | 0 | 0 |
| Privacy Policy | 0 | 0 | 0 |
| Components/API | 1+1 | 3 | 3 |
| **TOTAL** | **~17** | **~35** | **~33** |

---

## Prioritized Fix List (Critical only)

1. **Bookmarks page** — Replace SAMPLE_ARTICLES with real API; implement delete
2. **Admin access control** — Add `role === 'admin'` check on `/admin` and `/admin/bai-viet`
3. **`/admin/bai-viet/moi`** — Route does not exist; "Tạo bài mới" is broken
4. **Comment system** — Remove fake comments or implement real comment API
5. **Forgot password** — Must call real API endpoint
6. **Profile save/password change** — Must call real API endpoints
7. **Tag links `/tag/[slug]`** — Route does not exist
8. **AI Chat responses** — Must call real AI API
9. **`getAuthorPosts()`** — Does not filter by author

---

## Unresolved Questions

1. Does `POST /api/auth/login` return `accessToken` + `refreshToken` (as coded in `api.ts`) or just `token` (as described in task context)? The field name inconsistency could cause login to silently fail to store tokens.
2. Does `/api/authors/slug/{slug}` require an auth token? It is missing the `/api/public/` prefix used by all other public endpoints.
3. Is there a real AI chat API endpoint available in the backend, or is it still under development?
4. Is there a bookmarks API endpoint (`GET /api/user/bookmarks`, `POST`, `DELETE`)? Not visible in `api.ts`.
5. Is there a newsletter subscription API endpoint? Not in `api.ts`.
6. Is there a contact form API endpoint? Not in `api.ts`.
7. Is there a payment/token purchase API endpoint for the buy-tokens page?

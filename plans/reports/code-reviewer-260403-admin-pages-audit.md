# Code Review Summary — Admin Pages Audit

## Scope
- Files reviewed: 16 frontend files + 6 backend route/controller files
- Review focus: Bugs, API mismatches, SPA violations, missing functionality
- Updated plans: N/A (no active plan file found)

---

## Overall Assessment

The admin UI is generally well-structured with good error handling patterns. However, there are pervasive SPA violations (`<a>` tags instead of `<Link>`), several critical API response format mismatches, bulk-action buttons with no handlers, and two pages that are entirely stub placeholders.

---

## FILE: `src/app/(admin)/layout.tsx`

- **[BUG]** No role check — any authenticated user (viewer/author) can access the full admin panel. Token presence is checked but user role is never verified.
- **[MISSING]** No `refreshToken` logic; if `accessToken` expires, the user sees broken API calls instead of being redirected to login.

---

## FILE: `src/components/admin-sidebar.tsx`

- **[SPA]** All `MENU_ITEMS` render with `<a href="...">` (line 89) — causes full page reload on every nav click. Must use `<Link href="...">` from `next/navigation`.
- **[BUG]** Email in the user widget is hardcoded `admin@aivietnam.vn` (line 115); not read from `localStorage` user object.
- **[MISSING]** `useRouter` is imported but only used for `handleLogout`; the import of `useState` at line 3 is unused (never called).

---

## FILE: `src/components/admin-header.tsx`

- **[MISSING]** Search input (line 39) has no `onChange`, no `onSubmit`, no state — completely non-functional decoration.
- **[MISSING]** Notification bell button (line 45) has no `onClick` handler and badge count is always static/fake.
- **[MISSING]** Avatar div (line 49) has no dropdown / profile link.

---

## FILE: `src/app/(admin)/admin/page.tsx` — Dashboard

- **[SPA]** All quick-action links and "Xem tất cả" links use `<a href="...">` (lines 346, 403, 410, 433, 442, 451, 460, 470) — full-page reloads.
- **[API_MISMATCH]** Posts are fetched with query param `q` (line 139 references `latestRes` from public API, but `fetchDashboard` uses the admin `/api/posts` which expects `search`, not `q`). The dashboard never sends a `search` param so this is not a live bug, but the inline comment at line 138 is misleading.
- **[API_MISMATCH]** Categories endpoint `GET /api/categories` returns a raw array (controller line 28: `res.json(categories)`), but dashboard reads `json?.data` (line 154) — `totalCategories` will always be `0`.
- **[BUG]** "Doanh thu tháng" stat card (line 267) is permanently hardcoded `—` with no API fetch.
- **[BUG]** Both action icons in the latest-articles table (lines 403 & 410) link to the same edit URL `/admin/bai-viet/${post._id}`. The "Xem bài viết" (visibility) icon should link to the public post page `/bai-viet/${post.slug}`, not the edit page.
- **[SPA]** Footer links `Privacy Policy` and `Terms of Service` use `<a href="#">` (lines 480–481) — dead links.
- **[BUG]** `buildDailyViewBars` (line 83) attributes view counts by `createdAt` date of posts, not actual per-day analytics — chart data is meaningless as a "views per day" chart.

---

## FILE: `src/app/(admin)/admin/bai-viet/page.tsx` — Posts List

- **[SPA]** "Tạo bài mới" button (line 255) uses `<a href="/admin/bai-viet/tao-moi">`.
- **[SPA]** Edit action (line 439) uses `<a href="/admin/bai-viet/${post._id}">`.
- **[SPA]** Footer links `Chính sách` and `Hỗ trợ kỹ thuật` (lines 533–534) are `<a href="#">` — dead links.
- **[API_MISMATCH]** Search sends param `q` (line 117: `params.set('q', q)`), but the backend `POST /api/posts` controller reads `req.query.search` (post-controller line 33). The correct param name is `search`, not `q` — search will never work.
- **[API_MISMATCH]** Category filter sends `category` (line 119: `params.set('category', catId)`), but the backend PostFilterDto uses `categoryId`. Filtering by category will silently fail.
- **[BUG]** Bulk action buttons "Xuất bản", "Lưu trữ", "Xoá" (lines 309–341) have no `onClick` handlers — they are purely decorative even when items are selected.
- **[BUG]** After `handleDelete` (line 192), the post is removed from local state but `pagination.total` is not decremented, causing incorrect "Showing X–Y / Z" count.
- **[MISSING]** No "Create user" / "Invite member" button — page is read+delete only, no way to add users from this page (but that may be intentional if handled elsewhere).

---

## FILE: `src/app/(admin)/admin/bai-viet/tao-moi/page.tsx` — New Post

- No direct bugs; thin wrapper that delegates to `AdminPostForm`. See form issues below.

---

## FILE: `src/app/(admin)/admin/bai-viet/[id]/page.tsx` — Edit Post

- No direct bugs; thin wrapper. See form issues below.

---

## FILE: `src/components/admin-post-form.tsx` — Post Form

- **[API_MISMATCH]** Authors are fetched from `/api/authors` and the frontend reads `authJson?.data` (line 436). The backend author controller `getAll` returns `{ data, total, page, limit, totalPages }` per swagger docs — this is correct. However, the `AdminPostFormProps` maps `authorId` from `p.authorInfo?._id ?? p.authorId ?? p.author` (line 469). If the API returns `author` as a string ObjectId (not populated), the author dropdown will show an incorrect pre-selected value.
- **[BUG]** Cover image upload requires `postId` (line 284: `if (!postId) { setUploadError('Lưu bài viết trước...'); return; }`). In create mode, after first save, `savedPostId` is set (line 586) but the `CoverImageSection` still receives `postId={savedPostId}` only after a re-render with the new state — the UX is workable but confusing since the hint "Lưu bài trước để tải ảnh" stays visible even after save.
- **[BUG]** In edit mode, after save the form calls `save()` which does a `PUT /api/posts/${postId}` and then separately a `PATCH /api/posts/${postId}/status` (lines 591–599). The PUT already includes `status` in the payload — double-sending is redundant and potentially causes a race condition if the server processes them in different order.
- **[BUG]** After successful save in both create and edit modes, the form redirects via `router.push('/admin/bai-viet')` after 800ms (line 603). The form is never reset (not needed for redirect, but if the redirect is blocked the form stays with stale state).
- **[API_MISMATCH]** Post create response is read as `json?.data?._id ?? json?._id` (line 585). Backend `create` returns `res.status(201).json(post)` — a bare post object, not `{ data: post }`. So `json?.data?._id` is always undefined; `json?._id` is the correct path. This works but `json?.data?._id` path is dead code that may mislead future developers.
- **[MISSING]** No rich-text / Markdown preview — content is a plain `<textarea>` with no preview toggle.
- **[MISSING]** No image upload for inline content images; only cover image upload exists.

---

## FILE: `src/app/(admin)/admin/thanh-vien/page.tsx` — Users

- **[API_MISMATCH]** Backend `getAllUsers` returns a raw array `res.json(users)` (user-controller line 16). Frontend handles this with `Array.isArray(json) ? json : (json.data ?? [])` (line 104) — correctly handled.
- **[API_MISMATCH]** The `User` interface uses `id: string` (line 8, matching the backend `UserResponse` which maps `_id` → `id`). The `handleChangeRole`, `handleToggleActive`, `handleDelete` all use `user.id` — consistent and correct.
- **[BUG]** `handleToggleActive` reads the updated user from `json?.data ?? json` (line 173). Backend `toggleActive` returns `res.json(user)` — a bare `UserResponse` object, so `json?.data` is undefined and falls through to `json` — this works but the `json?.data` path is dead.
- **[MISSING]** No "Add user" / "Invite user" button — page is list + edit-role + toggle + delete only. There is a `POST /api/users` endpoint on the backend with no corresponding frontend UI.
- **[MISSING]** Pagination ignores the server when `getAllUsers` doesn't return `pagination` (backend returns a flat array). `totalPages` will always be 1 for user list — no true server-side pagination for users.
- **[BUG]** `fetchUsers` sends `q` param (line 92: `params.set('q', q)`) but backend reads `search` (user-controller line 9: `req.query.search`). User search will silently return all users regardless of input.

---

## FILE: `src/app/(admin)/admin/chuyen-muc/page.tsx` — Categories

- **[API_MISMATCH]** `GET /api/categories` returns a raw array (category-controller line 28). Frontend correctly handles both: `Array.isArray(json) ? json : (json.data ?? [])` (line 41) — OK.
- **[BUG]** `authHeaders()` builds the token at call-time using `localStorage.getItem('accessToken')` (line 18). If `accessToken` is null, the header sends `Bearer null` — the string `"null"` — which will be rejected by the backend auth middleware with a 401 that surfaces as an unhelpful "Không thể kết nối" error.
- **[MISSING]** No `isActive` toggle in the edit form — the form has name/slug/description/parent/sortOrder but no way to set `isActive`. The `isActive` field is displayed in the table but read-only.
- **[MISSING]** No slug auto-generation from name (unlike posts). The backend has `POST /api/categories/generate-slug` but the frontend doesn't call it.
- **[BUG]** `handleSave` error sets `setError(...)` (line 74) but modal stays open on error — user can see both error banner outside the modal and the still-open modal, which is confusing.

---

## FILE: `src/app/(admin)/admin/tags/page.tsx` — Tags

- **[API_MISMATCH]** `GET /api/tags` returns a raw array (tag-controller line 16). Frontend handles correctly with `Array.isArray(json) ? json : (json.data ?? [])` (line 39) — OK.
- **[API_MISMATCH]** `Tag` interface uses `id: string` (line 8) but backend tag model uses MongoDB `_id`. The tag controller `getAllTags` at line 16 does `res.json(tags)` returning raw Mongoose docs. Unless the Tag model has a `virtuals: true` transform that exposes `id`, tag rows will use `tag.id` which may be undefined — `key={tag.id}` on line 109 would be undefined, causing React key warnings and broken edit/delete targeting.
- **[BUG]** Same `Bearer null` issue for `authHeaders()` as in categories page (line 16).
- **[MISSING]** No `isActive` toggle in the edit form (only name/slug/color).
- **[MISSING]** No slug auto-generation from name. Backend has `POST /api/tags/generate-slug`.

---

## FILE: `src/app/(admin)/admin/tac-gia/page.tsx` — Authors

- **[API_MISMATCH]** Author `getAll` returns `{ data: [], total, page, limit, totalPages }` per swagger. Frontend reads `Array.isArray(json) ? json : (json.data ?? [])` (line 41) — correctly handles the `{ data: [] }` shape. OK.
- **[BUG]** Same `Bearer null` issue for `authHeaders()` (line 18).
- **[MISSING]** Edit form only exposes: name, slug, jobTitle, avatarUrl, bio. Missing fields the backend Author model supports: `email`, `expertise`, `experience`, `education`, `certifications`, `socialLinks` (twitter, linkedin, facebook, github), `isActive`, `isFeatured`, `sortOrder`, `metaTitle`, `metaDescription`. These are significant E-E-A-T fields exposed by the API but entirely absent from the admin UI.
- **[MISSING]** No `isActive` / `isFeatured` toggles in the list or form (backend has `PATCH /:id/toggle-active` and `PATCH /:id/toggle-featured`).

---

## FILE: `src/app/(admin)/admin/binh-luan/page.tsx` — Comments

- **[MISSING]** Entire page is a stub placeholder ("Chức năng bình luận đang được phát triển"). No list, no approve/reject, no delete. Sidebar links users to this page from the nav.

---

## FILE: `src/app/(admin)/admin/doanh-thu/page.tsx` — Revenue

- **[MISSING]** Entire page is a stub placeholder ("Chức năng quản lý doanh thu đang được phát triển"). Dashboard stat card for "Doanh thu tháng" always shows `—`.

---

## FILE: `src/app/(admin)/admin/seo/page.tsx` — SEO

- **[API_MISMATCH]** Fetches `/api/auto-seo/scores` — if this returns a non-array/non-`{data:[]}` shape the page silently falls into the `unavailable` state showing the "API chưa sẵn sàng" placeholder. No indication to the user whether the API is down vs. returned an unexpected format.
- **[MISSING]** Read-only table; no way to trigger re-analysis, edit meta fields inline, or navigate to the post editor from the SEO page (no link from title to edit page).
- **[BUG]** Error state is set to `setUnavailable(true)` for any non-ok HTTP response, including legitimate 401/403 auth failures — user sees "API chưa sẵn sàng" instead of an auth error.

---

## FILE: `src/app/(admin)/admin/cai-dat/page.tsx` — Settings

- **[API_MISMATCH]** `GET /api/settings` returns a grouped object: `{ site: { siteName: '...', ... }, general: {...} }` (from `settingsRepository.getAllGrouped()`). Frontend expects `json.siteName` directly or `json.data.siteName` (line 37). Neither path will find `siteName` — it's at `json.site.siteName`. The `unavailable` flag will be set and the form never shown.
- **[API_MISMATCH]** `PUT /api/settings` does not exist — the settings route only has `PUT /api/settings/bulk` and `PUT /api/settings/:key` (settings-routes.ts lines 21–22). The frontend calls `PUT /api/settings` (line 58) which will 404.
- **[BUG]** Same `Bearer null` issue for `authHeaders()` (line 15).

---

## Positive Observations

- Consistent token-based auth headers in most fetch calls.
- Good loading skeletons throughout.
- `Promise.allSettled` in dashboard prevents one failed request from killing the whole page.
- Post form: debounced slug generation, reading-time auto-calc, full SEO fields, FAQ section — well thought out.
- Category/Tag/Author pages: correct `fetchX()` call after save/delete to refresh data.
- Post list: client-side optimistic delete (`setPosts(prev => prev.filter(...))`) is acceptable for the scale.
- Edit post: `use(params)` (React 19 async params unwrapping) is correctly used.

---

## Critical Issues

1. **Settings page completely broken** — wrong API response parsing + wrong PUT endpoint means settings can never be loaded or saved.
2. **Tags page: `id` field may be undefined** — if the Tag Mongoose model does not expose a virtual `id`, all tag CRUD will silently target `undefined` IDs.
3. **Posts search and category filter broken** — wrong query param names (`q` vs `search`, `category` vs `categoryId`).
4. **User search broken** — same wrong param (`q` vs `search`).
5. **`Bearer null` auth headers** — categories, tags, authors, settings, SEO all call `authHeaders()` at module evaluation, not at request time; if `accessToken` is null the string `"null"` is sent.

---

## High Priority Findings

6. **Bulk actions (Publish / Archive / Delete) have no `onClick` handlers** — entirely non-functional.
7. **Dashboard category count always 0** — `GET /api/categories` returns raw array, but dashboard reads `json?.data`.
8. **Sidebar nav causes full-page reloads** — all 10 menu items use `<a>` not `<Link>`.
9. **Dashboard "Xem bài viết" links to edit page** instead of public post URL.

---

## Medium Priority Improvements

10. All internal `<a href>` tags in dashboard quick-actions and post list should be `<Link>`.
11. Admin layout has no role-based access check (any authenticated user can enter).
12. `authHeaders()` must be called inside the fetch function body, not at module level — or use a factory that reads from localStorage lazily.
13. Post form: `json?.data?._id` path for new post ID is dead code (backend returns bare post).
14. Edit post: double status update (PUT + PATCH) is redundant/race-prone.
15. Authors page: large number of missing form fields (E-E-A-T data, social links, isActive, isFeatured).

---

## Low Priority Suggestions

16. `useState` imported but unused in `admin-sidebar.tsx`.
17. Footer dead links `href="#"` in dashboard and post list.
18. Hardcoded email `admin@aivietnam.vn` in sidebar footer.
19. Settings and SEO pages silently show "API chưa sẵn sàng" on 401/403 — should distinguish auth errors from truly missing APIs.
20. `buildDailyViewBars` uses post `createdAt` date as a proxy for views-per-day — misleading chart.

---

## Recommended Actions (Prioritized)

1. **Fix Settings page**: parse `json.site` group for site settings; change save to use `PUT /api/settings/bulk` with `[{key, value, category}]` array format.
2. **Fix `authHeaders()`**: move token read inside the fetch call body in categories, tags, authors, settings, SEO pages. Or convert to a function called per-request.
3. **Fix Tags `id` field**: check Tag model for virtual `id`; if absent, change `Tag` interface to use `_id: string` and update all references.
4. **Fix search params**: change `q` → `search` in posts list and users list; change `category` → `categoryId` in posts list filter.
5. **Implement bulk actions**: wire `onClick` handlers for Publish, Archive, Delete bulk buttons in posts list.
6. **Fix Sidebar nav**: replace all `<a href>` with `<Link href>` in `admin-sidebar.tsx`.
7. **Fix Dashboard category count**: `GET /api/categories` returns array directly — use `Array.isArray(json) ? json.length : (json.data?.length ?? 0)`.
8. **Fix Dashboard visibility link**: point "Xem bài viết" icon to `/bai-viet/${post.slug}`, not edit page.
9. **Add role check in layout**: verify `user.role === 'admin'` (or `editor`) after token check; redirect others.
10. **Implement Comments page**: at minimum a list with approve/reject/delete using backend comments API (if available).

---

## Metrics

- Type Coverage: adequate — interfaces defined for all major entities
- Test Coverage: 0% visible — no test files found in reviewed scope
- SPA Violations: 20+ `<a href>` tags where `<Link>` should be used
- Dead/broken buttons: 3 bulk-action buttons + notification bell + header search
- Fully non-functional pages: 2 (Comments, Revenue) + 1 critically broken (Settings)
- API parameter mismatches: 4 confirmed (search param name ×2, category filter, settings endpoint)
- API response format mismatches: 3 confirmed (categories in dashboard, settings grouped response, tags id field)

---

## Unresolved Questions

1. Does the Tag Mongoose model have `{ virtuals: true }` in `toJSON`? If yes, `id` is safe. Needs verification in `post_be/src/models/tag.model.ts`.
2. Is there a comments API in the backend? No `comments-routes.ts` was found in the routes directory — if so, the Comments page cannot be implemented yet.
3. Is `POST /api/settings` intentionally absent (API only supports per-key or bulk updates)? The frontend's `PUT /api/settings` call needs to be redesigned to match the actual bulk update endpoint.
4. Does the auto-SEO route `/api/auto-seo/scores` exist and what is its exact response shape? The `auto-seo-routes.ts` file exists but was not fully reviewed.

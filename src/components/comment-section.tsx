'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { API } from '@/lib/api';
import {
  getComments,
  postComment,
  editComment,
  deleteComment,
  toggleCommentLike,
} from '@/lib/api';
// getCommentCount removed: count is already in pagination.total from getComments response
import { timeAgo } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentUser {
  _id: string;
  name: string;
  avatarUrl?: string | null;
}

interface Comment {
  _id: string;
  content: string;
  author: CommentUser | null;
  authorId: string | null;
  parentId: string | null;
  likesCount: number;
  likedByMe: boolean;
  isDeleted: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface CurrentUser {
  _id: string;
  name: string;
  avatarUrl?: string | null;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = 36 }: { user: CommentUser | CurrentUser | null; size?: number }) {
  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#d1fae5',
        color: '#065f46',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─── Comment Input Box ─────────────────────────────────────────────────────────

function CommentInput({
  currentUser,
  onSubmit,
  placeholder = 'Viết bình luận...',
  autoFocus = false,
  onCancel,
  compact = false,
}: {
  currentUser: CurrentUser | null;
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    // Not logged in → show login prompt
    if (!currentUser) {
      setLoginPrompt(true);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      {/* Login prompt banner */}
      {loginPrompt && !currentUser && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: 10,
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 8,
            fontSize: 14,
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#059669' }}>info</span>
          <span>
            Vui lòng{' '}
            <Link href="/dang-nhap" style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}>
              đăng nhập
            </Link>{' '}
            để bình luận. Chuyên gia sẽ phản hồi sớm nhất!
          </span>
          <button
            onClick={() => setLoginPrompt(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Avatar user={currentUser} size={compact ? 30 : 36} />
        <div style={{ flex: 1 }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); setLoginPrompt(false); }}
            onKeyDown={handleKeyDown}
            placeholder={currentUser ? placeholder : 'Viết bình luận để chuyên gia hỗ trợ bạn...'}
            rows={compact ? 2 : 3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 14,
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              background: '#fff',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#059669')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
            {/* Character count: show remaining chars to prevent over-limit submissions */}
            <span
              style={{
                fontSize: 11,
                color: text.length > 1900 ? (text.length > 2000 ? '#ef4444' : '#f59e0b') : '#9ca3af',
                marginRight: 'auto',
              }}
            >
              {text.length}/2000
            </span>
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                Hủy
              </button>
            )}
            {/* Disabled while submitting to prevent double-submit */}
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting || text.length > 2000}
              style={{
                padding: '5px 16px',
                borderRadius: 6,
                border: 'none',
                background: text.trim() && !submitting && text.length <= 2000 ? '#059669' : '#d1d5db',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: text.trim() && !submitting && text.length <= 2000 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
              {submitting ? 'Đang gửi...' : 'Bình luận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Single Comment ────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  currentUser,
  postId,
  onReplySubmit,
  onLike,
  onEdit,
  onDelete,
  isReply = false,
}: {
  comment: Comment;
  currentUser: CurrentUser | null;
  postId: string;
  onReplySubmit: (parentId: string, content: string) => Promise<void>;
  onLike: (commentId: string) => void;
  onEdit: (commentId: string, newContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isReply?: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const isOwn = currentUser && comment.authorId === currentUser._id;

  const handleEditSubmit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || editSubmitting) return;
    setEditSubmitting(true);
    try {
      await onEdit(comment._id, trimmed);
      setEditMode(false);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Xóa bình luận này?')) return;
    await onDelete(comment._id);
  };

  const replies = comment.replies ?? [];

  if (comment.isDeleted) {
    return (
      <div style={{ display: 'flex', gap: 10, padding: '8px 0' }}>
        {!isReply && <div style={{ width: 36, flexShrink: 0 }} />}
        <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>Bình luận đã bị xóa.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0' }}>
      <Avatar user={comment.author} size={isReply ? 30 : 36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>
            {comment.author?.name ?? 'Người dùng'}
          </span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{timeAgo(comment.createdAt)}</span>
        </div>

        {/* Content / Edit mode */}
        {editMode ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #059669',
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  fontSize: 12,
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={!editText.trim() || editSubmitting}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#059669',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#374151', margin: 0, wordBreak: 'break-word' }}>
            {comment.content}
          </p>
        )}

        {/* Actions */}
        {!editMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            {/* Like */}
            <button
              onClick={() => onLike(comment._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                padding: '3px 8px',
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 12,
                color: comment.likedByMe ? '#059669' : '#6b7280',
                fontWeight: comment.likedByMe ? 700 : 400,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 16,
                  fontVariationSettings: comment.likedByMe
                    ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20"
                    : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
                }}
              >
                thumb_up
              </span>
              {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
            </button>

            {/* Reply — only on top-level */}
            {!isReply && currentUser && (
              <button
                onClick={() => setShowReplyInput((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#6b7280',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>reply</span>
                Trả lời
              </button>
            )}

            {/* Edit / Delete — own comment */}
            {isOwn && (
              <>
                <button
                  onClick={() => { setEditMode(true); setEditText(comment.content); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#6b7280',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#ef4444',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  Xóa
                </button>
              </>
            )}
          </div>
        )}

        {/* Reply input */}
        {showReplyInput && (
          <div style={{ marginTop: 10 }}>
            <CommentInput
              currentUser={currentUser}
              placeholder={`Trả lời ${comment.author?.name ?? ''}...`}
              autoFocus
              compact
              onCancel={() => setShowReplyInput(false)}
              onSubmit={async (content) => {
                await onReplySubmit(comment._id, content);
                setShowReplyInput(false);
              }}
            />
          </div>
        )}

        {/* Replies */}
        {replies.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {!showReplies ? (
              <button
                onClick={() => setShowReplies(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#059669',
                  fontWeight: 600,
                  padding: '2px 0',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
                Xem {replies.length} phản hồi
              </button>
            ) : (
              <div>
                <button
                  onClick={() => setShowReplies(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#6b7280',
                    padding: '2px 0',
                    marginBottom: 6,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_less</span>
                  Ẩn phản hồi
                </button>
                <div style={{ borderLeft: '2px solid #e5e7eb', paddingLeft: 12 }}>
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      currentUser={currentUser}
                      postId={postId}
                      onReplySubmit={onReplySubmit}
                      onLike={onLike}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isReply
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userChecked, setUserChecked] = useState(false);

  // Fetch current user once
  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('token')
        : null;
    if (!token) {
      setUserChecked(true);
      return;
    }
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user || data?.data || data?._id) {
          const u = data.user ?? data.data ?? data;
          setCurrentUser({ _id: u._id ?? u.id, name: u.name, avatarUrl: u.avatarUrl ?? u.avatar ?? null });
        }
      })
      .catch(() => {})
      .finally(() => setUserChecked(true));
  }, []);

  // Use a ref for currentUser so loadComments doesn't need it in deps.
  // Without this, adding currentUser to deps causes a double-fetch:
  // once on mount (currentUser=null) and again after auth check resolves.
  const currentUserRef = useRef<CurrentUser | null>(null);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // loadComments only depends on postId — stable across renders.
  // currentUser is read via ref to avoid stale-closure issues without re-subscribing.
  const loadComments = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const res = await getComments(postId, pageNum);
        const uid = currentUserRef.current?._id;
        const mapUser = (u: any) => u ? { _id: u._id, name: u.name, avatarUrl: u.avatarUrl ?? u.avatar ?? null } : null;
        const mapComment = (c: any): Comment => ({
          _id: c._id,
          content: c.content,
          author: mapUser(c.user ?? c.author),
          authorId: c.user?._id ?? c.author?._id ?? c.authorId ?? null,
          parentId: c.parentId ?? null,
          likesCount: c.likesCount ?? 0,
          likedByMe: uid ? (c.likes ?? []).includes(uid) : false,
          isDeleted: c.isDeleted ?? false,
          createdAt: c.createdAt,
          replies: (c.replies ?? []).map((r: any) => mapComment(r)),
        });
        const fetched: Comment[] = (res.data ?? []).map(mapComment);

        setComments((prev) => (append ? [...prev, ...fetched] : fetched));
        const pagination = res.pagination;
        if (pagination) {
          const totalPages = Math.ceil((pagination.total ?? 0) / (pagination.limit ?? 20));
          setHasMore(pageNum < totalPages);
          // count comes from pagination.total — no need for a separate getCommentCount call
          if (!append) setCount(pagination.total ?? fetched.length);
        }
      } catch {
        if (!append) setError('Không thể tải bình luận.');
      }
    },
    [postId] // currentUser intentionally excluded — read via ref to prevent double-fetch
  );

  // Wait for userChecked so likedByMe is accurate on first load.
  // Only runs once per postId after auth status is known.
  useEffect(() => {
    if (!userChecked) return;
    const init = async () => {
      setLoading(true);
      await loadComments(1);
      setLoading(false);
    };
    init();
  }, [postId, userChecked, loadComments]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    await loadComments(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleNewComment = async (content: string) => {
    const res = await postComment(postId, content);
    const c = res.data;
    if (!c) return;
    const u = c.user ?? c.author;
    const newComment: Comment = {
      _id: c._id,
      content: c.content,
      author: u ? { _id: u._id, name: u.name, avatarUrl: u.avatarUrl ?? u.avatar ?? null } : currentUser,
      authorId: u?._id ?? currentUser?._id ?? null,
      parentId: null,
      likesCount: 0,
      likedByMe: false,
      isDeleted: false,
      createdAt: c.createdAt ?? new Date().toISOString(),
      replies: [],
    };
    setComments((prev) => [newComment, ...prev]);
    setCount((n) => n + 1);
  };

  const handleReplySubmit = async (parentId: string, content: string) => {
    const res = await postComment(postId, content, parentId);
    const c = res.data;
    if (!c) return;
    const ru = c.user ?? c.author;
    const newReply: Comment = {
      _id: c._id,
      content: c.content,
      author: ru ? { _id: ru._id, name: ru.name, avatarUrl: ru.avatarUrl ?? ru.avatar ?? null } : currentUser,
      authorId: ru?._id ?? currentUser?._id ?? null,
      parentId,
      likesCount: 0,
      likedByMe: false,
      isDeleted: false,
      createdAt: c.createdAt ?? new Date().toISOString(),
      replies: [],
    };
    setComments((prev) =>
      prev.map((cm) =>
        cm._id === parentId
          ? { ...cm, replies: [...(cm.replies ?? []), newReply] }
          : cm
      )
    );
    setCount((n) => n + 1);
  };

  const handleLike = async (commentId: string) => {
    // Optimistic update
    const updateLike = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c._id === commentId) {
          const liked = !c.likedByMe;
          return { ...c, likedByMe: liked, likesCount: c.likesCount + (liked ? 1 : -1) };
        }
        return { ...c, replies: c.replies ? updateLike(c.replies) : [] };
      });

    setComments((prev) => updateLike(prev));

    try {
      await toggleCommentLike(commentId);
    } catch {
      // Revert on error
      setComments((prev) => updateLike(prev));
    }
  };

  const handleEdit = async (commentId: string, newContent: string) => {
    await editComment(commentId, newContent);
    const applyEdit = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c._id === commentId) return { ...c, content: newContent };
        return { ...c, replies: c.replies ? applyEdit(c.replies) : [] };
      });
    setComments((prev) => applyEdit(prev));
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    const applyDelete = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c._id === commentId) return { ...c, isDeleted: true };
        return { ...c, replies: c.replies ? applyDelete(c.replies) : [] };
      });
    setComments((prev) => applyDelete(prev));
    setCount((n) => Math.max(0, n - 1));
  };

  return (
    <div>
      {/* Header */}
      <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#111827' }}>
        Bình luận{count > 0 ? ` (${count})` : ''}
      </h3>

      {/* Comment input */}
      {userChecked && (
        <div style={{ marginBottom: 24 }}>
          <CommentInput currentUser={currentUser} onSubmit={handleNewComment} />
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid #f3f4f6', marginBottom: 8 }} />

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
          Đang tải bình luận...
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#ef4444', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && comments.length === 0 && (
        <div
          style={{
            padding: '32px 0',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#d1d5db' }}>
            chat_bubble
          </span>
          <p style={{ margin: 0 }}>Chưa có bình luận. Hãy là người đầu tiên!</p>
        </div>
      )}

      {/* Comment list */}
      {!loading && !error && comments.length > 0 && (
        <div>
          {comments.map((comment) => (
            <div
              key={comment._id}
              style={{ borderBottom: '1px solid #f3f4f6' }}
            >
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                postId={postId}
                onReplySubmit={handleReplySubmit}
                onLike={handleLike}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: loadingMore ? 'default' : 'pointer',
              color: '#374151',
            }}
          >
            {loadingMore ? 'Đang tải...' : 'Xem thêm bình luận'}
          </button>
        </div>
      )}
    </div>
  );
}

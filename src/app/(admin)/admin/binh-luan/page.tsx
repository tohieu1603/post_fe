'use client';

export default function CommentsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-full flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Bình luận</h2>
        <p className="text-slate-500 text-sm">Chức năng bình luận đang được phát triển</p>
        <p className="text-slate-400 text-xs mt-2">Vui lòng quay lại sau</p>
      </div>
    </div>
  );
}

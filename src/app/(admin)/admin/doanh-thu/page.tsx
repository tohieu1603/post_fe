'use client';

export default function RevenuePage() {
  return (
    <div className="p-6 bg-slate-50 min-h-full flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Doanh thu</h2>
        <p className="text-slate-500 text-sm">Chức năng quản lý doanh thu đang được phát triển</p>
        <p className="text-slate-400 text-xs mt-2">Vui lòng quay lại sau</p>
      </div>
    </div>
  );
}

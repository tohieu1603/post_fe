'use client';

import { useState } from 'react';

export function AiChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-emerald-600 dark:bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_16px_32px_-8px_rgba(0,108,73,0.3)] hover:scale-110 hover:brightness-110 transition-all group cursor-pointer relative"
        >
          <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>chat</span>
          <span className="absolute -top-1 -right-1 bg-tertiary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-surface">2</span>
        </button>
      )}
      {open && (
        <div className="w-[400px] h-[500px] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/20">
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>smart_toy</span>
              <span className="font-bold text-on-surface">AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>smart_toy</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-2xl rounded-tl-none text-sm text-on-surface">
                Xin chào! Tôi có thể giúp gì cho bạn về AI?
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-outline-variant/20">
            <div className="flex gap-2">
              <input className="flex-1 px-4 py-2 bg-surface-container-high border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Hỏi bất cứ điều gì..." />
              <button className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant/50 mt-2 text-center">💎 1 token/câu hỏi • Free: 5 câu hỏi/ngày</p>
          </div>
        </div>
      )}
    </div>
  );
}

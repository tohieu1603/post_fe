'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { streamChat } from '@/lib/api';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'ai',
    text: 'Xin chào! Tôi là AI Vietnam, trợ lý trí tuệ nhân tạo của bạn. Tôi có thể giúp bạn tìm hiểu về AI, đọc và tóm tắt bài viết, hoặc trả lời bất kỳ câu hỏi nào bạn muốn hỏi.',
    time: '10:42',
  },
];

const QUICK_PROMPTS = ['Claude Code là gì?', 'So sánh với Cursor', 'Cách cài đặt'];

let msgIdCounter = 2;

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;
    const now = new Date();
    const userMsg: Message = { id: ++msgIdCounter, role: 'user', text: text.trim(), time: formatTime(now) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const aiMsgId = ++msgIdCounter;
    // Add empty AI message that will be streamed into
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '', time: formatTime(new Date()) }]);

    try {
      // Build history for API
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

      const stream = streamChat(history);
      for await (const chunk of stream) {
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, text: m.text + chunk } : m)
        );
      }
    } catch (err: any) {
      const errorText = err?.message?.includes('401')
        ? 'Vui lòng đăng nhập để sử dụng AI Chat.'
        : 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.';
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, text: m.text || errorText } : m)
      );
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        body { font-family: 'Inter', sans-serif; }`}} />
      {/*  SideNavBar Component (Shared Anchor)  */}
<div className="bg-surface text-on-surface overflow-hidden h-[100dvh] flex">
<aside className={`${mobileSidebarOpen ? 'flex' : 'hidden'} md:flex h-screen w-[280px] border-r border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 flex-col p-4 gap-2 font-inter text-sm font-medium fixed left-0 top-0 z-40`}>
<div className="flex items-center gap-3 mb-6 px-2">
<div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>smart_toy</span>
</div>
<div>
<h1 className="text-lg font-black text-emerald-900 dark:text-emerald-100 leading-none">AI Vietnam</h1>
<p className="text-xs text-emerald-700/60 font-medium">Trí tuệ nhân tạo</p>
</div>
</div>
{/*  Start New Conversation Button  */}
<button
  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-on-primary rounded-lg font-bold shadow-sm hover:opacity-90 transition-all mb-4"
  onClick={() => setMessages(INITIAL_MESSAGES)}
>
<span className="material-symbols-outlined">add_comment</span>
<span>Cuộc trò chuyện mới</span>
</button>
<div className="flex-1 overflow-y-auto space-y-6">
{/*  Today Section  */}
<div className="space-y-1">
<h3 className="px-2 text-[10px] uppercase tracking-wider font-bold text-emerald-800/50">Hôm nay</h3>
<div className="space-y-1">
<div className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 shadow-sm rounded-lg border-l-4 border-primary transition-all duration-200 ease-in-out">
<span className="truncate">Cuộc trò chuyện hiện tại</span>
</div>
</div>
</div>
{/*  Navigation Links  */}
<nav className="space-y-1 pt-4 border-t border-emerald-100 dark:border-emerald-900">
<Link className="flex items-center gap-3 px-3 py-2 text-emerald-800/60 dark:text-emerald-400/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-all" href="/">
<span className="material-symbols-outlined">explore</span>
<span>Khám phá AI</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2 text-emerald-800/60 dark:text-emerald-400/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-all" href="/tai-khoan">
<span className="material-symbols-outlined">settings</span>
<span>Cài đặt</span>
</Link>
</nav>
</div>
{/*  User Tokens & CTA  */}
<div className="mt-auto space-y-3 pt-4">
<div className="bg-emerald-100/80 dark:bg-emerald-900/50 p-3 rounded-xl">
<div className="flex items-center justify-between mb-2">
<span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">💎 150 tokens còn lại</span>
<span className="text-[10px] text-emerald-700">80%</span>
</div>
<div className="w-full bg-emerald-200 dark:bg-emerald-800 h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full w-[80%]"></div>
</div>
</div>
<Link href="/tai-khoan/nap-token" className="block w-full py-2 bg-tertiary text-on-tertiary rounded-lg text-xs font-bold hover:opacity-90 transition-all text-center">
                Nâng cấp Pro
            </Link>
</div>
</aside>
{/* Mobile sidebar backdrop */}
{mobileSidebarOpen && (
  <div
    className="fixed inset-0 bg-black/40 z-30 md:hidden"
    onClick={() => setMobileSidebarOpen(false)}
  />
)}
{/*  Main Chat Area  */}
<main className="flex-1 flex flex-col bg-surface-container-lowest relative h-[100dvh] md:ml-[280px] min-w-0">
{/*  TopBar Header  */}
<header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-surface-container-high bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
<div className="flex items-center gap-4">
<button
  className="md:hidden text-on-surface-variant w-11 h-11 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors"
  onClick={() => setMobileSidebarOpen(prev => !prev)}
>
<span className="material-symbols-outlined">{mobileSidebarOpen ? 'close' : 'menu'}</span>
</button>
<div className="flex flex-col">
<h2 className="text-base font-bold text-on-surface leading-tight">AI Vietnam Chat</h2>
<div className="flex items-center gap-2 mt-0.5">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
<span className="w-1.5 h-1.5 rounded-full bg-primary mr-1 animate-pulse"></span>
                            Sẵn sàng
                        </span>
</div>
</div>
</div>
<div className="flex items-center gap-2">
<button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
<span className="material-symbols-outlined">share</span>
</button>
<Link href="/tai-khoan" className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
<span className="material-symbols-outlined">settings</span>
</Link>
</div>
</header>
{/*  Messages Area  */}
<section className="flex-1 overflow-y-auto p-3 md:p-8 space-y-6 md:space-y-8 min-h-0">
{messages.map(msg => (
  msg.role === 'ai' ? (
    <div key={msg.id} className="flex gap-3 md:gap-4 max-w-4xl mx-auto items-start">
      <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-on-primary-container text-sm" style={{fontVariationSettings: '"FILL" 1'}}>smart_toy</span>
      </div>
      <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
        <div className="bg-surface-container-low p-3 md:p-4 rounded-2xl rounded-tl-none border border-surface-container-high text-on-surface leading-relaxed text-sm md:text-base break-words">
          {msg.text}
        </div>
        <span className="text-[10px] text-on-surface-variant/50 ml-1">{msg.time}</span>
      </div>
    </div>
  ) : (
    <div key={msg.id} className="flex gap-3 md:gap-4 max-w-4xl mx-auto items-start flex-row-reverse">
      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0 overflow-hidden">
        <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
      </div>
      <div className="flex flex-col items-end space-y-2 md:space-y-3 max-w-[85%]">
        <div className="bg-primary text-on-primary p-3 md:p-4 rounded-2xl rounded-tr-none shadow-sm leading-relaxed text-sm md:text-base break-words">
          {msg.text}
        </div>
        <span className="text-[10px] text-on-surface-variant/50 mr-1">{msg.time}</span>
      </div>
    </div>
  )
))}
{isTyping && (
  <div className="flex gap-3 md:gap-4 max-w-4xl mx-auto items-start">
    <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
      <span className="material-symbols-outlined text-on-primary-container text-sm" style={{fontVariationSettings: '"FILL" 1'}}>smart_toy</span>
    </div>
    <div className="flex-1">
      <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none border border-surface-container-high inline-flex items-center gap-1">
        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
      </div>
    </div>
  </div>
)}
<div ref={messagesEndRef} />
</section>
{/*  Bottom Input Area  */}
<footer className="p-3 md:p-6 bg-surface-container-lowest border-t border-surface-container-low flex-shrink-0">
<div className="max-w-4xl mx-auto space-y-4">
{/*  Prompt Chips  */}
<div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
{QUICK_PROMPTS.map(prompt => (
  <button
    key={prompt}
    className="whitespace-nowrap px-4 py-1.5 rounded-full border border-outline-variant text-xs font-medium text-on-surface-variant hover:bg-emerald-50 hover:border-primary transition-all"
    onClick={() => sendMessage(prompt)}
    type="button"
  >
    {prompt}
  </button>
))}
</div>
{/*  Input Box  */}
<form onSubmit={handleSubmit}>
<div className="relative group">
<textarea
  className="w-full bg-surface-container-low border-0 rounded-2xl p-4 pr-14 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none placeholder:text-on-surface-variant/40"
  placeholder="Hỏi bất cứ điều gì..."
  rows={2}
  value={input}
  onChange={e => setInput(e.target.value)}
  onKeyDown={handleKeyDown}
></textarea>
<button
  className="absolute right-3 bottom-3 w-11 h-11 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
  type="submit"
  disabled={!input.trim() || isTyping}
>
<span className="material-symbols-outlined">send</span>
</button>
</div>
</form>
{/*  Footer Meta  */}
<div className="flex items-center justify-between px-2 gap-2">
<div className="flex items-center gap-3 text-[10px] font-medium text-on-surface-variant/50 flex-shrink-0">
<span className="flex items-center gap-1"><span className="text-tertiary">💎</span> 1 token/câu hỏi</span>
<span className="hidden sm:flex items-center gap-1">150 tokens còn lại</span>
</div>
<div className="text-[10px] text-on-surface-variant/30 hidden sm:block text-right">
                        AI có thể đưa ra câu trả lời sai. Hãy kiểm tra lại thông tin quan trọng.
                    </div>
</div>
</div>
</footer>
</main>
{/*  Visual Overlays (Intentional Asymmetry)  */}
<div className="fixed top-20 right-[-100px] w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
<div className="fixed bottom-20 md:left-[200px] w-[200px] h-[200px] bg-tertiary/5 blur-[100px] rounded-full pointer-events-none hidden md:block"></div>
</div>
    </>
  );
}

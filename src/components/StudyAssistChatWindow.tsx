import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  Layers,
  ChevronDown,
  Cpu,
  GripHorizontal,
  RotateCcw
} from 'lucide-react';
import { DomainInfo, ProgressSummary } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: string;
}

interface StudyAssistChatWindowProps {
  currentDomain: DomainInfo;
  progressSummary: ProgressSummary | null;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `👋 **Welcome to your Microsoft Study Assistant!**\n\nI am powered by Gemini AI to help you master any Microsoft exam (Azure, AI, Security, Data, DevOps, Power Platform).\n\n**Here's how I can help you:**\n- 📝 **Practice Quizzes**: Ask for scenario-based questions with answer breakdowns.\n- 💡 **Concept Explanations**: Deep dive into any Azure service, architecture, or protocol.\n- 🎯 **Exam Traps**: Learn the most common distractor choices and tricky exam wording.\n- 📅 **Study Plans**: Get a customized timeline based on your completed milestones.\n\n*Click a quick prompt below or ask any question!*`,
  model: 'gemini-3.7-flash',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const StudyAssistChatWindow: React.FC<StudyAssistChatWindowProps> = ({
  currentDomain,
  progressSummary,
  isOpen,
  onToggleOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('msft_study_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [includeContext, setIncludeContext] = useState(true);

  // Position & Dragging State
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const savedPos = localStorage.getItem('msft_study_chat_pos');
      if (savedPos) {
        return JSON.parse(savedPos);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save position when it changes
  useEffect(() => {
    if (position) {
      try {
        localStorage.setItem('msft_study_chat_pos', JSON.stringify(position));
      } catch {
        // ignore
      }
    }
  }, [position]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExpanded) return;
    // Don't trigger drag if clicking buttons or input controls
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }

    const currentX = position ? position.x : (window.innerWidth - 480);
    const currentY = position ? position.y : (window.innerHeight - 620);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: Math.max(10, Math.min(window.innerWidth - 400, currentX)),
      posY: Math.max(10, Math.min(window.innerHeight - 300, currentY)),
    };

    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isExpanded) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }
    const touch = e.touches[0];
    const currentX = position ? position.x : (window.innerWidth - 380);
    const currentY = position ? position.y : (window.innerHeight - 560);

    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX: Math.max(10, Math.min(window.innerWidth - 320, currentX)),
      posY: Math.max(10, Math.min(window.innerHeight - 250, currentY)),
    };

    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const newX = Math.max(8, Math.min(window.innerWidth - 340, dragStartRef.current.posX + deltaX));
      const newY = Math.max(8, Math.min(window.innerHeight - 150, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.startX;
      const deltaY = touch.clientY - dragStartRef.current.startY;

      const newX = Math.max(8, Math.min(window.innerWidth - 300, dragStartRef.current.posX + deltaX));
      const newY = Math.max(8, Math.min(window.innerHeight - 150, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleResetPosition = () => {
    setPosition(null);
    localStorage.removeItem('msft_study_chat_pos');
  };

  // Save to local storage on message change
  useEffect(() => {
    try {
      localStorage.setItem('msft_study_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear your study assistant chat history?')) {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
      localStorage.removeItem('msft_study_chat_history');
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!customPrompt) setInputMessage('');
    setIsLoading(true);

    try {
      const completedCerts = includeContext && progressSummary
        ? progressSummary.certifications
            .filter(c => c.status === 'completed')
            .map(c => ({ code: c.code, title: c.title }))
        : [];

      const targetCert = progressSummary?.nextRecommendedCert?.code || 'General Microsoft Certification';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: includeContext ? {
            currentDomain: currentDomain.title,
            completedCerts,
            targetCert,
          } : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: 'assistant_' + Date.now(),
        role: 'assistant',
        content: data.message || 'I could not generate a response. Please try again.',
        model: data.model || 'gemini-3.7-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMessage: ChatMessage = {
        id: 'fallback_' + Date.now(),
        role: 'assistant',
        content: `I ran into a temporary network glitch. Here is a quick study note for **${currentDomain.title}**:\n\nReview the official skills measured outline on Microsoft Learn for **${progressSummary?.nextRecommendedCert?.code || currentDomain.title}**. Focus on core architecture diagrams and high-availability configuration options!`,
        model: 'offline-resilient-guide',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick starter questions tailored to domain
  const quickPrompts = [
    `🎯 Give me 2 practice questions for ${progressSummary?.nextRecommendedCert?.code || currentDomain.title}`,
    `💡 Explain key concepts to pass ${progressSummary?.nextRecommendedCert?.code || currentDomain.title}`,
    `⚡ What are the top exam distractor traps?`,
    `📅 Give me a 2-week study schedule for ${currentDomain.title}`,
  ];

  // Helper to format markdown text simply (bold, bullets, code)
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bullet point
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 my-0.5">
            {renderInlineMarkdown(content)}
          </li>
        );
      }
      // Numbered item
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-slate-200 my-0.5">
            {renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="my-1 leading-relaxed text-slate-200">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-cyan-300 text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Launcher Button (when closed) */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          className="fixed bottom-6 right-6 z-40 liquid-glass-pill px-4 py-3 flex items-center gap-3 text-white border-cyan-400/50 bg-gradient-to-r from-blue-600/40 via-slate-900/90 to-cyan-600/40 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group liquid-glow-cyan"
          title="Open AI Study Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>Study Assistant AI</span>
              <Sparkles className="w-3 h-3 text-cyan-300" />
            </div>
            <div className="text-[10px] text-slate-300 font-medium">
              Ask Exam Questions & Tips
            </div>
          </div>
        </button>
      )}

      {/* Floating Chat Window Modal / Drawer (when open) */}
      {isOpen && (
        <div
          ref={windowRef}
          style={
            isExpanded
              ? undefined
              : position
              ? {
                  position: 'fixed',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  margin: 0,
                }
              : undefined
          }
          className={`fixed z-50 transition-all ${
            isDragging ? 'duration-0 select-none shadow-cyan-500/20' : 'duration-200'
          } ${
            isExpanded
              ? 'inset-4 sm:inset-8'
              : !position
              ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[460px] h-[600px] max-h-[85vh]'
              : 'w-[calc(100vw-2rem)] sm:w-[460px] h-[600px] max-h-[85vh]'
          } flex flex-col liquid-glass-card rounded-2xl border-cyan-400/50 bg-slate-950/95 shadow-2xl overflow-hidden backdrop-blur-xl`}
        >
          {/* Top Decorative Gradient */}
          <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shrink-0" />

          {/* Window Header (Draggable Handle) */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={`p-3 sm:p-3.5 border-b border-white/10 flex items-center justify-between gap-2 bg-slate-900/85 shrink-0 ${
              isExpanded ? '' : 'cursor-grab active:cursor-grabbing hover:bg-slate-900 select-none'
            }`}
            title={isExpanded ? '' : 'Click and drag anywhere on this header to move the window'}
          >
            <div className="flex items-center gap-2">
              <div className="text-slate-500 hover:text-slate-300 mr-0.5 hidden sm:block">
                <GripHorizontal className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    AI Study Assistant
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5" /> Gemini 3.7
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Context: {currentDomain.title}</span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              {position && !isExpanded && (
                <button
                  onClick={handleResetPosition}
                  className="liquid-glass-pill p-1.5 text-slate-400 hover:text-cyan-300 border-white/10 hover:border-cyan-400/30 transition-colors cursor-pointer"
                  title="Reset to default bottom-right position"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={handleClearHistory}
                className="liquid-glass-pill p-1.5 text-slate-400 hover:text-rose-300 border-white/10 hover:border-rose-400/30 transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="liquid-glass-pill p-1.5 text-slate-400 hover:text-white border-white/10 hover:border-white/30 transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Restore Window Size' : 'Expand Fullscreen'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onToggleOpen}
                className="liquid-glass-pill p-1.5 text-slate-400 hover:text-white border-white/10 hover:border-white/30 transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="px-4 py-2 bg-slate-900/50 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">
                Track: <strong className="text-slate-300">{currentDomain.title}</strong>
                {progressSummary?.nextRecommendedCert && (
                  <span className="text-cyan-300 font-semibold ml-1.5">
                    &bull; Target: {progressSummary.nextRecommendedCert.code}
                  </span>
                )}
              </span>
            </div>

            <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer shrink-0 ml-2">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={(e) => setIncludeContext(e.target.checked)}
                className="rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0 text-xs cursor-pointer"
              />
              <span className="text-[10px]">Sync Context</span>
            </label>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-normal selection:bg-cyan-500 selection:text-white">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 relative group ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-900/90 border border-white/15 text-slate-200 rounded-tl-none shadow-lg'
                    }`}
                  >
                    {/* Header info for assistant */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] text-slate-400 border-b border-white/5 pb-1">
                        <span className="font-semibold text-cyan-300">
                          {msg.model || 'Gemini 3.7 Flash'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{msg.timestamp}</span>
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
                            title="Copy Answer"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="space-y-1">
                      {renderFormattedText(msg.content)}
                    </div>

                    {isUser && (
                      <div className="text-[9px] text-blue-200 text-right mt-1 opacity-80">
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Generating indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-slate-900/90 border border-white/15 rounded-2xl rounded-tl-none p-3.5 text-slate-300 flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-medium">Gemini is formulating your study response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-900/60 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" /> Suggested:
            </span>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="liquid-glass-pill px-2.5 py-1 text-[11px] text-slate-300 hover:text-white border-white/10 hover:border-cyan-400/40 hover:bg-cyan-500/10 whitespace-nowrap shrink-0 transition-all cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any Microsoft exam or cloud architecture question..."
                disabled={isLoading}
                className="flex-1 bg-slate-900/90 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="liquid-glass-pill p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-cyan-400/80 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-md shadow-cyan-500/20"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 px-1">
              <span>Press Enter to send</span>
              <span className="text-cyan-400/80 font-medium">Official Exam Guide Grounded</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

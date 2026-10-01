import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Copy,
  Flame,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { apiService } from '../services/apiService';
import { ChatMessage, NavigationTab, SemesterMetric, Subject } from '../types/attendance';

interface AiAssistantViewProps {
  metric: SemesterMetric;
  subjects: Subject[];
  targetPercentage: number;
  setActiveTab: (tab: NavigationTab) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  metric,
  subjects,
  targetPercentage,
  setActiveTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **Kalasalingam University (KARE) AI Attendance Advisor**.\n\nI have loaded your live semester standings:\n- **Overall Attendance:** **${metric.overallPercentage.toFixed(1)}%**\n- **Target:** **${targetPercentage}%**\n- **Safe Bunks:** **${metric.overallSafeBunks} classes**\n- **Recovery Needed:** **${metric.overallRecoveryNeeded} classes**\n\nHow can I help you plan your academic leaves, mid-term eligibility, or attendance recovery today?`,
      timestamp: Date.now(),
      suggestions: [
        'Can I take 2 days off next week without getting detained?',
        'Which course has the lowest attendance right now?',
        'How many consecutive classes to recover to 75%?',
        'Explain Kalasalingam University medical condonation rules',
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMsgId = 'user-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const attendanceContext = {
        overallPercentage: metric.overallPercentage,
        targetPercentage,
        totalConducted: metric.totalConducted,
        totalAttended: metric.totalAttended,
        safeBunks: metric.overallSafeBunks,
        recoveryNeeded: metric.overallRecoveryNeeded,
        subjects: subjects.map((s) => ({
          code: s.code,
          name: s.name,
          conducted: Object.values(s.components).reduce((acc, c) => acc + (c.conducted || 0), 0),
          attended: Object.values(s.components).reduce((acc, c) => acc + (c.attended || 0), 0),
        })),
      };

      const res = await apiService.askAiAdvisor(query, attendanceContext);

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: res.reply || 'I analyzed your attendance data. Please consult your academic coordinator for specific departmental exemptions.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: `Based on your records, your attendance is **${metric.overallPercentage.toFixed(1)}%**. You have **${metric.overallSafeBunks} safe bunks** remaining.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top AI Status Banner */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                AI Academic Attendance Advisor
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Gemini Powered</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personalized leave guidance, bunk forecasting, and university condonation analysis
            </p>
          </div>
        </div>

        {/* Live Attendance Snapshot */}
        <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs shrink-0 font-mono">
          <div className="text-center px-2">
            <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold">Standing</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {metric.overallPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center px-2">
            <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold">Safe Bunks</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">
              {metric.overallSafeBunks}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center px-2">
            <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold">Target</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {targetPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800/90 flex flex-col h-[520px] overflow-hidden shadow-sm">
        {/* Messages Scroll View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white dark:bg-slate-700'
                      : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs whitespace-pre-line'
                    }`}
                  >
                    {msg.text}

                    {/* Copy Button */}
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/50 dark:bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(sug)}
                          className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 transition-colors cursor-pointer text-left"
                        >
                          &bull; {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                <span>Consulting Kalasalingam University attendance guidelines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything (e.g. 'Can I bunk 2 classes tomorrow?', 'Recovery strategy')..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white hover:opacity-95 disabled:opacity-40 transition-opacity cursor-pointer shrink-0 shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

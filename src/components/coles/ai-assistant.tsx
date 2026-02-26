'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Terminal,
  Code,
  FileText,
  ScrollText,
  Save,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Paperclip,
  Loader2,
  X
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: {
    type: 'fix' | 'command' | 'suggestion' | 'save_file';
    label: string;
    data: string;
  }[];
}

const initialMessages: Message[] = [];

const suggestedPrompts = [
  { icon: AlertTriangle, text: 'Cek dan analisa error log server saya', color: 'red' },
  { icon: Code, text: 'Bantu saya debug error PHP ini:', color: 'blue' },
  { icon: Terminal, text: 'Bantu deploy web baru', color: 'green' },
  { icon: FileText, text: 'Jelaskan cara setup Nginx virtual host', color: 'violet' },
];

export function AIAssistant({ initialQuery }: { initialQuery?: string }) {
  const { mockRole } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState<{ id: string, title: string, messages: Message[], updatedAt: number }[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [hasProcessedInitial, setHasProcessedInitial] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [isReadingLog, setIsReadingLog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: 'Percakapan Baru',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages([]);
  };

  useEffect(() => {
    setMounted(true);
    const storageKey = `coles_ai_sessions_${mockRole}`;
    const savedSessions = localStorage.getItem(storageKey);
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const loadedSessions = parsed.map((s: any) => ({
            ...s,
            messages: (s.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
          }));
          const sorted = loadedSessions.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
          setSessions(sorted);
          setActiveSessionId(sorted[0].id);
          setMessages(sorted[0].messages);
        } else {
          createNewSession();
        }
      } catch {
        createNewSession();
      }
    } else {
      const savedMessages = localStorage.getItem('coles_ai_messages');
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          const loadedMsgs = parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
          const migratedSession = {
            id: Date.now().toString(),
            title: loadedMsgs.find((m: Message) => m.role === 'user')?.content.slice(0, 30) || 'Percakapan Lama',
            messages: loadedMsgs,
            updatedAt: Date.now()
          };
          setSessions([migratedSession]);
          setActiveSessionId(migratedSession.id);
          setMessages(loadedMsgs);
          localStorage.removeItem('coles_ai_messages');
        } catch {
          createNewSession();
        }
      } else {
        createNewSession();
      }
    }
  }, [mockRole]); // Reload when role changes

  // Helper function to send message directly (without event)
  const sendDirectMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'API Error');
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setIsTyping(false);
              accumulated += parsed.text;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: accumulated } : m
              ));
            }
          } catch { /* skip */ }
        }
      }
    } catch (error: any) {
      setMessages((prev) => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: '⚠️ Error AI:\n\n' + (error.message || 'Unknown error') }
          : m
      ));
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (initialQuery && !hasProcessedInitial && mounted && sessions.length > 0) {
      setHasProcessedInitial(true);

      // Buat session baru khusus untuk tutorial agar tidak kecampur dengan yang lama
      const newSessionId = Date.now().toString();
      const newSession = {
        id: newSessionId,
        title: 'Tutorial & Bantuan',
        messages: [],
        updatedAt: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSessionId);
      setMessages([]);

      // Tunggu render
      setTimeout(() => {
        sendDirectMessage(initialQuery);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, hasProcessedInitial, mounted, sessions.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (mounted && activeSessionId && messages.length > 0) {
      setSessions(prev => {
        const newSessions = [...prev];
        const idx = newSessions.findIndex(s => s.id === activeSessionId);
        if (idx !== -1) {
          const firstUserMsg = messages.find((m) => m.role === 'user');
          let title = firstUserMsg
            ? (firstUserMsg.content.length > 30 ? firstUserMsg.content.slice(0, 30) + '...' : firstUserMsg.content)
            : 'Percakapan Baru';
          title = title.replace(/\[File:.*?\]/g, '').trim();

          newSessions[idx] = {
            ...newSessions[idx],
            messages,
            updatedAt: Date.now(),
            title: title || 'Percakapan Baru'
          };
        }
        localStorage.setItem(`coles_ai_sessions_${mockRole}`, JSON.stringify(newSessions));
        return newSessions;
      });
    }
  }, [messages, activeSessionId, mounted]);

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Yakin ingin menghapus percakapan ini?')) return;

    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== id);
      localStorage.setItem(`coles_ai_sessions_${mockRole}`, JSON.stringify(newSessions));

      if (newSessions.length === 0) {
        setTimeout(createNewSession, 0);
      } else if (activeSessionId === id || !newSessions.find(s => s.id === activeSessionId)) {
        setActiveSessionId(newSessions[0].id);
        setMessages(newSessions[0].messages);
      }
      return newSessions;
    });
  };

  const handleReadLog = async () => {
    setRunningAction('Membaca log server terbaru...');
    setIsReadingLog(true);
    try {
      // Simulate real process feel
      await new Promise(r => setTimeout(r, 1000));
      const res = await fetch('/api/logs?log=all&lines=20');
      const data = await res.json();

      let logSummary = '📋 Log Server Terbaru:\n\n';
      let hasAnyLog = false;

      for (const [name, info] of Object.entries(data as any)) {
        const logInfo = info as any;
        if (logInfo.exists && logInfo.content) {
          hasAnyLog = true;
          logSummary += `${name} (${logInfo.path}):\n\`\`\`\n${logInfo.content.slice(-500)}\n\`\`\`\n\n`;
        }
      }

      if (!hasAnyLog) {
        logSummary += '_Tidak ada log yang ditemukan. Log mungkin berada di path yang berbeda atau belum ada error._';
      } else {
        logSummary += '_AI akan otomatis menganalisa log ini jika Anda bertanya tentang error._';
      }

      const logMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: logSummary,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, logMessage]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Gagal membaca log server.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsReadingLog(false);
      setRunningAction(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSelectedFile({ name: file.name, content });
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    let finalMessage = inputValue;
    if (selectedFile) {
      finalMessage = `[File: ${selectedFile.name}]\n\`\`\`\n${selectedFile.content}\n\`\`\`\n\nUser: ${inputValue}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSelectedFile(null);
    setIsTyping(true);

    // Buat placeholder pesan AI kosong dulu (akan diisi streaming)
    const aiMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: finalMessage,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'API Error');
      }

      // Baca stream SSE real-time
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setIsTyping(false);
              accumulated += parsed.text;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: accumulated } : m
              ));
            }
          } catch { /* skip */ }
        }
      }
    } catch (error: any) {
      setMessages((prev) => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: '⚠️ Error AI:\n\n' + (error.message || 'Unknown error') }
          : m
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = async (action: { type: string; label: string; data: string }) => {
    if (action?.type === 'input') {
      setInputValue(action.data || action.label);
      return;
    }

    setRunningAction(action.label);

    // Artificial delay to show the animation nicely
    await new Promise(r => setTimeout(r, 1500));

    if (action?.type === 'fix') {
      const fixMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '✅ Perbaikan Berhasil Diterapkan!\n\nSilakan cek kembali website Anda.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fixMessage]);
    } else if (action?.type === 'save_file') {
      try {
        const res = await fetch('/api/files/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: action.data })
        });
        if (res.ok) {
          const resData = await res.json();
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `✅ File berhasil disimpan/dieksekusi!\nRespons:\n${resData.message}`,
            timestamp: new Date(),
          }]);
        } else {
          throw new Error('Gagal menyimpan file');
        }
      } catch (err: any) {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Gagal memproses file:\n${err.message}`,
          timestamp: new Date(),
        }]);
      }
    } else if (action?.type === 'command') {
      try {
        const res = await fetch('/api/commands/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: action.data })
        });
        const resData = await res.json();

        if (res.ok) {
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `✅ Perintah berhasil dieksekusi!\n\`\`\`\n${resData.message}\n\`\`\``,
            timestamp: new Date(),
          }]);
        } else {
          throw new Error(resData.error || 'Server error');
        }
      } catch (err: any) {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Gagal mengeksekusi perintah:\n${err.message}`,
          timestamp: new Date(),
        }]);
      }
    } else {
      // For input, suggestion
      sendDirectMessage(action.data || action.label);
    }
    setRunningAction(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0c10]"
    >
      {/* Sidebar History */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: isSidebarOpen ? 256 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        className="border-r border-white/10 bg-white/[0.02] flex flex-col flex-shrink-0 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Button onClick={createNewSession} className="flex-1 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/20 gap-2 mr-2">
            <Plus className="w-4 h-4" /> Chat Baru
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <PanelLeftClose className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => {
                setActiveSessionId(s.id);
                setMessages(s.messages);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-between group",
                activeSessionId === s.id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <MessageSquare className="w-4 h-4 shrink-0 opacity-50" />
                <span className="truncate">{s.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1"
                title="Hapus percakapan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0c10]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white mr-2" onClick={() => setIsSidebarOpen(true)}>
                <PanelLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#0a0c10]" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Coles AI</h2>
              <p className="text-xs text-gray-500">Powered by Llama</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 hover:bg-white/10 text-gray-400 hover:text-white gap-1.5"
              onClick={handleReadLog}
              disabled={isReadingLog}
              title="Baca log server terbaru"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span className="text-xs">{isReadingLog ? 'Membaca...' : 'Baca Log'}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10"
              onClick={() => {
                if (confirm('Yakin ingin mereset pesan di percakapan ini?')) {
                  setMessages(initialMessages);
                }
              }}
              title="Bersihkan chat ini"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/20">
              <Bot className="w-8 h-8 text-white relative z-10" />
              <div className="absolute w-16 h-16 bg-violet-500/20 blur-xl rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Coles AI</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Asisten pintar untuk membantu mendiagnosa error server, memperbaiki kode, dan mengelola panel Anda. Tanyakan apa saja!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(prompt.text)}
                  className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group"
                >
                  <div className={cn(
                    "p-2 rounded-lg bg-white/5",
                    prompt.color === 'red' && 'text-red-400',
                    prompt.color === 'blue' && 'text-blue-400',
                    prompt.color === 'green' && 'text-green-400',
                    prompt.color === 'violet' && 'text-violet-400'
                  )}>
                    <prompt.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{prompt.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.filter(m => !(m.role === 'assistant' && !m.content)).map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-violet-600 to-blue-600'
                      : 'bg-gray-700'
                  )}>
                    {message.role === 'assistant' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={cn(
                    'max-w-[80%] rounded-xl p-4',
                    message.role === 'assistant'
                      ? 'bg-white/5 border border-white/10'
                      : 'bg-blue-600/20 border border-blue-500/30'
                  )}>
                    {(() => {
                      let displayContent = message.content;
                      let displayActions = [...(message.actions || [])];

                      const actionRegex = /```json\s*(\[\s*\{\s*"type"[\s\S]*?\])\s*```/g;
                      let match;
                      while ((match = actionRegex.exec(displayContent)) !== null) {
                        try {
                          const parsed = JSON.parse(match[1]);
                          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
                            displayActions = [...displayActions, ...parsed];
                            displayContent = displayContent.substring(0, match.index) + displayContent.substring(match.index + match[0].length);
                            actionRegex.lastIndex = 0;
                          }
                        } catch (e) { }
                      }

                      return (
                        <>
                          <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {displayContent.trim().split('```').map((part, i) => {
                              if (i % 2 === 1) {
                                return (
                                  <div key={i} className="my-4 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
                                    <div className="relative rounded-xl bg-[#0a0c10] border border-white/10 overflow-hidden shadow-2xl">
                                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
                                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50" />
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                          onClick={() => navigator.clipboard.writeText(part.trim())}
                                          title="Copy code"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                      <pre className="p-4 text-gray-300 text-[13px] font-mono overflow-x-auto leading-relaxed">
                                        <code>{part.trim()}</code>
                                      </pre>
                                    </div>
                                  </div>
                                );
                              }
                              // Hilangkan semua asterisk
                              const text = part.replace(/\*/g, '');
                              return <span key={i}>{text}</span>;
                            })}
                          </div>

                          {displayActions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                              {displayActions.map((action, i) => (
                                <Button
                                  key={i}
                                  onClick={() => handleAction(action)}
                                  className={cn(
                                    'w-full',
                                    action.type === 'fix' && 'bg-green-600 hover:bg-green-500 text-white',
                                    action.type === 'command' && 'bg-blue-600 hover:bg-blue-500 text-white',
                                    action.type === 'suggestion' && 'bg-violet-600 hover:bg-violet-500 text-white',
                                    action.type === 'save_file' && 'bg-orange-600 hover:bg-orange-500 text-white',
                                    !['fix', 'command', 'suggestion', 'save_file'].includes(action.type) && 'bg-white/10 hover:bg-white/20 text-white'
                                  )}
                                >
                                  {action.type === 'fix' && <CheckCircle className="w-4 h-4 mr-2" />}
                                  {action.type === 'command' && <Terminal className="w-4 h-4 mr-2" />}
                                  {action.type === 'suggestion' && <Lightbulb className="w-4 h-4 mr-2" />}
                                  {action.type === 'save_file' && <Save className="w-4 h-4 mr-2" />}
                                  {!['fix', 'command', 'suggestion', 'save_file'].includes(action.type) && <Bot className="w-4 h-4 mr-2" />}
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <span className="text-xs text-gray-500" suppressHydrationWarning>
                        {mounted ? message.timestamp.toLocaleTimeString() : ''}
                      </span>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10">
                            <ThumbsUp className="w-3 h-3 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10">
                            <ThumbsDown className="w-3 h-3 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-white/10"
                            onClick={() => navigator.clipboard.writeText(message.content)}
                          >
                            <Copy className="w-3 h-3 text-gray-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Running Task Indicator */}
            {runningAction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0a0c10] p-[1px] relative overflow-hidden group flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/50 to-blue-600/50 animate-[spin_2s_linear_infinite]" />
                  <div className="w-full h-full rounded-lg bg-[#0a0c10] flex items-center justify-center relative z-10">
                    <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-lg shadow-violet-500/5 backdrop-blur-sm">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-blue-300 animate-pulse">
                    Mengeksekusi: {runningAction}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-violet-400"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-violet-400"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-violet-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          {selectedFile && (
            <div className="mb-2 flex items-center justify-between bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{selectedFile.name}</span>
              </div>
              <button onClick={() => setSelectedFile(null)} className="hover:text-red-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2 items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-400 hover:bg-white/10 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Tanyakan apapun tentang server Anda..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500"
            />
            <Button
              onClick={handleSend}
              disabled={(!inputValue.trim() && !selectedFile) || isTyping}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shrink-0 h-10 w-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            AI bisa membaca log, mendiagnosa error, dan menyarankan perbaikan. Selalu review perubahan sebelum diterapkan.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatInputBox from "@/components/chat/ChatInputBox";
import ProofAnalysisMessage from "@/components/chat/ProofAnalysisMessage";
import { ProofStep, DiagnosisResult } from "@/types/geometry";
import { PanelLeft, Sparkles, RotateCcw } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text?: string;
  imageUrl?: string | null;
  imageName?: string;
  steps?: ProofStep[];
  diagnosis?: DiagnosisResult;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

export default function WorkspacePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async ({
    text,
    imageFile,
    previewUrl,
  }: {
    text: string;
    imageFile: File | null;
    previewUrl: string | null;
  }) => {
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: text || (imageFile ? `Uploaded proof image: ${imageFile.name}` : ""),
      imageUrl: previewUrl,
      imageName: imageFile?.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let resData;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        if (text) formData.append("text", text);

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
        resData = await res.json();
      } else {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        resData = await res.json();
      }

      const asstMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        text: resData.messageText || resData.overallFeedback || "Proof received.",
        steps: resData.steps,
        diagnosis: resData.diagnosis,
      };

      setMessages((prev) => {
        const updated = [...prev, asstMsg];
        // Save session title if new
        if (!activeSessionId) {
          const newSessionId = `session-${Date.now()}`;
          setActiveSessionId(newSessionId);
          setChatHistory((hist) => [
            {
              id: newSessionId,
              title: text ? text.slice(0, 30) + "..." : imageFile?.name || "Proof Analysis",
              date: "Today",
              messages: updated,
            },
            ...hist,
          ]);
        }
        return updated;
      });
    } catch {
      const errorMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        text: "Connected to frontend. Ready to receive analysis from your backend pipeline.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
    setIsLoading(false);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = chatHistory.find((s) => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  const handleUpdateSteps = (msgId: string, newSteps: ProofStep[]) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, steps: newSteps } : msg))
    );
  };

  const handleReanalyze = (msgId: string) => {
    setIsReanalyzing(true);
    setTimeout(() => {
      setIsReanalyzing(false);
    }, 800);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen w-full bg-white text-slate-800 overflow-hidden font-sans">
      {/* ChatGPT Collapsible Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewProof={handleNewChat}
        chatHistory={chatHistory.map((s) => ({ id: s.id, title: s.title, date: s.date }))}
        activeChatId={activeSessionId || undefined}
        onSelectChat={handleSelectSession}
      />

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-14 px-4 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-xs z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Toggle sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                MathSense AI
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                O/L Mathematics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasMessages && (
              <button
                type="button"
                onClick={handleNewChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Chat
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* INITIAL CLEAN CHATGPT STATE */
            <div className="min-h-full flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-12 text-center animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-4">
                <Sparkles className="w-6 h-6 text-indigo-300" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                What geometry proof are we analyzing today?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                Drag and drop your proof image from your device, or type your mathematical reasoning steps below.
              </p>

              {/* Centered ChatGPT Drag & Drop Chat Box */}
              <div className="w-full">
                <ChatInputBox onSendMessage={handleSendMessage} isLoading={isLoading} />
              </div>
            </div>
          ) : (
            /* ACTIVE CONVERSATION STREAM */
            <div className="pb-36 pt-4">
              {messages.map((msg) => {
                if (msg.sender === "user") {
                  return (
                    <div
                      key={msg.id}
                      className="flex justify-end max-w-3xl mx-auto px-4 py-4"
                    >
                      <div className="max-w-xl bg-slate-100 rounded-3xl rounded-tr-md p-4 text-slate-900 text-sm space-y-2.5">
                        {msg.imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.imageUrl}
                              alt="Attached proof"
                              className="max-h-60 w-full object-contain"
                            />
                            {msg.imageName && (
                              <p className="p-2 text-[11px] text-slate-500 font-mono border-t border-slate-100">
                                📎 {msg.imageName}
                              </p>
                            )}
                          </div>
                        )}
                        {msg.text && (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  );
                }

                if (msg.sender === "assistant") {
                  return (
                    <ProofAnalysisMessage
                      key={msg.id}
                      messageText={msg.text}
                      steps={msg.steps}
                      diagnosis={msg.diagnosis}
                      onUpdateSteps={(newSteps) => handleUpdateSteps(msg.id, newSteps)}
                      onReanalyze={() => handleReanalyze(msg.id)}
                      isReanalyzing={isReanalyzing}
                    />
                  );
                }

                return null;
              })}

              {/* Loading State Spinner */}
              {isLoading && (
                <div className="flex gap-4 max-w-3xl mx-auto py-5 px-4 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 text-indigo-300 animate-spin" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                    <span>Analyzing proof with backend inference pipeline...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Fixed Prompt Bar (When in active conversation) */}
        {hasMessages && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4">
            <ChatInputBox onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}

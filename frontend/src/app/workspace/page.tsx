"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatInputBox from "@/components/chat/ChatInputBox";
import ProofAnalysisMessage from "@/components/chat/ProofAnalysisMessage";
import { submitProofAnalysis } from "@/services/api";
import { AnalyzeProofResponse } from "@/types/api";
import { PanelLeft, RotateCcw, AlertTriangle, RefreshCw, Compass, Loader2 } from "lucide-react";

interface SubmissionMessage {
  id: string;
  sender: "user" | "assistant";
  problemText?: string;
  imageUrl?: string;
  imageName?: string;
  response?: AnalyzeProofResponse;
  error?: string;
  rawFile?: File;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: SubmissionMessage[];
}

export default function WorkspacePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<SubmissionMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to latest response
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async ({
    imageFile,
    problemText,
    previewUrl,
  }: {
    imageFile: File;
    problemText?: string;
    previewUrl: string;
  }) => {
    const userMsgId = `user-${Date.now()}`;
    const userMsg: SubmissionMessage = {
      id: userMsgId,
      sender: "user",
      problemText,
      imageUrl: previewUrl,
      imageName: imageFile.name,
      rawFile: imageFile,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Direct call to FastAPI backend: POST /api/v1/analyze-proof
      const data = await submitProofAnalysis(imageFile, problemText);

      const asstMsg: SubmissionMessage = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        response: data,
      };

      setMessages((prev) => {
        const updated = [...prev, asstMsg];
        if (!activeSessionId) {
          const newSessionId = `session-${Date.now()}`;
          setActiveSessionId(newSessionId);
          setChatHistory((hist) => [
            {
              id: newSessionId,
              title: problemText
                ? problemText.slice(0, 32) + "..."
                : imageFile.name,
              date: "Today",
              messages: updated,
            },
            ...hist,
          ]);
        }
        return updated;
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze proof with backend.";

      const errorMsg: SubmissionMessage = {
        id: `error-${Date.now()}`,
        sender: "assistant",
        error: errorMessage,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (msg: SubmissionMessage) => {
    if (msg.rawFile && msg.imageUrl) {
      handleSendMessage({
        imageFile: msg.rawFile,
        problemText: msg.problemText,
        previewUrl: msg.imageUrl,
      });
    }
  };

  const handleNewProof = () => {
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

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen w-full bg-white text-slate-800 overflow-hidden font-sans">
      {/* Collapsible Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewProof={handleNewProof}
        chatHistory={chatHistory.map((s) => ({ id: s.id, title: s.title, date: s.date }))}
        activeChatId={activeSessionId || undefined}
        onSelectChat={handleSelectSession}
      />

      {/* Main Workbench Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-14 px-4 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-xs z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                MathSense AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasMessages && (
              <button
                type="button"
                onClick={handleNewProof}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Proof
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* INITIAL CLEAN EMPTY STATE */
            <div className="min-h-full flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-12 text-center animate-in fade-in duration-300">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs mb-4">
                <Compass className="w-6 h-6 text-white" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                Geometry Proof &amp; Misconception Analyzer
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed">
                Drag and drop your handwritten geometry proof image (.png or .jpg) or upload from your device to analyze reasoning steps.
              </p>

              {/* Centered Drag & Drop Chat Box */}
              <div className="w-full">
                <ChatInputBox onSendMessage={handleSendMessage} isLoading={isLoading} />
              </div>
            </div>
          ) : (
            /* CONVERSATION STREAM */
            <div className="pb-36 pt-4 space-y-2">
              {messages.map((msg, index) => {
                if (msg.sender === "user") {
                  return (
                    <div
                      key={msg.id}
                      className="flex justify-end max-w-3xl mx-auto px-4 py-3"
                    >
                      <div className="max-w-xl bg-slate-100 rounded-3xl rounded-tr-md p-4 text-slate-900 text-sm space-y-2">
                        {msg.imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.imageUrl}
                              alt="Attached proof"
                              className="max-h-64 w-full object-contain"
                            />
                            {msg.imageName && (
                              <p className="p-2 text-[11px] text-slate-500 font-mono border-t border-slate-100">
                                📎 {msg.imageName}
                              </p>
                            )}
                          </div>
                        )}
                        {msg.problemText && (
                          <p className="leading-relaxed whitespace-pre-wrap font-medium">
                            {msg.problemText}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }

                if (msg.sender === "assistant") {
                  if (msg.error) {
                    const lastUserMsg = messages[index - 1];
                    return (
                      <div
                        key={msg.id}
                        className="max-w-3xl mx-auto px-4 py-4 animate-in fade-in"
                      >
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-3">
                          <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>Backend Connection Error</span>
                          </div>
                          <p className="text-rose-900 leading-relaxed font-mono">
                            {msg.error}
                          </p>
                          {lastUserMsg && (
                            <button
                              type="button"
                              onClick={() => handleRetry(lastUserMsg)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Retry Submission
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (msg.response) {
                    return (
                      <ProofAnalysisMessage key={msg.id} response={msg.response} />
                    );
                  }
                }

                return null;
              })}

              {/* Live Loading Indicator */}
              {isLoading && (
                <div className="flex gap-4 max-w-3xl mx-auto py-5 px-4 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                    <span>
                      Uploading image &amp; running backend OCR &amp; reasoning pipeline...
                    </span>
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

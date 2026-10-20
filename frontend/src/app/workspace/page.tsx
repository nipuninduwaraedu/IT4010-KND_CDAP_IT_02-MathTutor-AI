"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatInputBox from "@/components/chat/ChatInputBox";
import ProofAnalysisMessage from "@/components/chat/ProofAnalysisMessage";
import { SAMPLE_PROBLEM } from "@/data/mockData";
import { ProofStep, DiagnosisResult } from "@/types/geometry";
import {
  PanelLeft,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text?: string;
  imageUrl?: string | null;
  imageName?: string;
  steps?: ProofStep[];
  diagnosis?: DiagnosisResult;
}

export default function WorkspacePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = ({
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
      text: text || "Please analyze this handwritten geometry proof sheet.",
      imageUrl: previewUrl,
      imageName: imageFile?.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate Member 1 OCR + Member 2 Reasoning inference pipeline
    setTimeout(() => {
      const defaultCase = SAMPLE_PROBLEM.sampleSubmissions[0];
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        steps: defaultCase.steps,
        diagnosis: JSON.parse(JSON.stringify(defaultCase.diagnosis)),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1400);
  };

  const handleNewProof = () => {
    setMessages([]);
    setIsLoading(false);
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
    }, 900);
  };

  const handlePromptChipClick = (chipPrompt: string) => {
    handleSendMessage({
      text: chipPrompt,
      imageFile: null,
      previewUrl: null,
    });
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen w-full bg-white text-slate-800 overflow-hidden font-sans">
      {/* ChatGPT Collapsible Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewProof={handleNewProof}
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
                O/L Geometry Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasMessages && (
              <button
                type="button"
                onClick={handleNewProof}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Proof
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* INITIAL EMPTY STATE: Exactly like ChatGPT Welcome */
            <div className="min-h-full flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-12 text-center animate-in fade-in duration-300">
              {/* ChatGPT-style Sparkle Avatar */}
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-4">
                <Sparkles className="w-6 h-6 text-indigo-300" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                What geometry proof are we analyzing today?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                Drop your handwritten proof image into the box below or type your steps. We’ll transcribe the OCR math and diagnose logical misconceptions.
              </p>

              {/* Center Input Box in Initial State */}
              <div className="w-full mb-8">
                <ChatInputBox
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  isInitialCentered={true}
                />
              </div>

              {/* Quick Prompt Suggestion Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl text-left">
                <button
                  type="button"
                  onClick={() =>
                    handlePromptChipClick(
                      "In circle with center O, AB is diameter, C on circumference. Verify proof that ∠ACB = 90°."
                    )
                  }
                  className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-2xs transition-all text-xs group"
                >
                  <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    📐 Angle in a Semicircle (Thm 25.3)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Verify right-angle subtended by a diameter
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePromptChipClick(
                      "Verify proof that angle subtended by an arc at the center is double the angle at the circumference (Theorem 26.1)."
                    )
                  }
                  className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-2xs transition-all text-xs group"
                >
                  <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    ⭕ Center Angle vs Circumference (Thm 26.1)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Check central angle double relationship
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePromptChipClick(
                      "Analyze student proof for opposite angles of cyclic quadrilateral summing to 180°."
                    )
                  }
                  className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-2xs transition-all text-xs group"
                >
                  <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    🔷 Cyclic Quadrilateral (Thm 27.1)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Check opposite angles supplementary condition
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePromptChipClick(
                      "Diagnose common student fallacy: applying semicircle theorem to a non-diameter chord."
                    )
                  }
                  className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-2xs transition-all text-xs group"
                >
                  <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    ⚠️ Premature Theorem Application
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Detect missing diameter prerequisite
                  </p>
                </button>
              </div>
            </div>
          ) : (
            /* CONVERSATION STREAM: Messages */
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
                              className="max-h-56 w-full object-contain"
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

                if (msg.sender === "assistant" && msg.steps && msg.diagnosis) {
                  return (
                    <ProofAnalysisMessage
                      key={msg.id}
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
                    <span>Transcribing handwriting with OCR &amp; running misconception classifier...</span>
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

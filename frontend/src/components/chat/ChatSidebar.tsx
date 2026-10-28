"use client";

import React from "react";
import Link from "next/link";
import { Plus, MessageSquare, PanelLeftClose, BookOpen } from "lucide-react";
import Logo from "../common/Logo";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewProof: () => void;
  chatHistory?: { id: string; title: string; date: string }[];
  activeChatId?: string;
  onSelectChat?: (id: string) => void;
}

/**
 * Clean ChatGPT-style collapsible sidebar with official MathTutor AI logo.
 */
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onToggle,
  onNewProof,
  chatHistory = [],
  activeChatId,
  onSelectChat,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 bg-[#f9f9f9] border-r border-slate-200 w-64 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:-ml-64"
        }`}
      >
        {/* Top bar: Brand & Toggle */}
        <div className="p-3.5 flex items-center justify-between border-b border-slate-200/70">
          <Link href="/workspace" className="flex items-center gap-2.5 group">
            <Logo size={28} className="group-hover:scale-105 transition-transform" />
            <span className="font-bold text-sm text-slate-800 tracking-tight">
              MathTutor AI
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Submission & Remedial Practice Buttons */}
        <div className="p-3 space-y-2">
          <button
            type="button"
            onClick={onNewProof}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>New Proof Submission</span>
          </button>

          <Link
            href="/recommendation"
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-indigo-200/80 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-900 text-xs font-semibold transition-all duration-150"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Remedial Practice</span>
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              Recommended
            </span>
          </Link>
        </div>

        {/* Submissions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 px-2 tracking-wide uppercase">
            Active Session
          </span>

          {chatHistory.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-slate-400">
              No proof analyses yet.
            </div>
          ) : (
            <div className="space-y-1">
              {chatHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectChat && onSelectChat(item.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors truncate cursor-pointer ${
                    activeChatId === item.id
                      ? "bg-slate-200/80 text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;

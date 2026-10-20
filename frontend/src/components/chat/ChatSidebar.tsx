"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  Compass,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewProof: () => void;
  activeChatId?: string;
  onSelectChat?: (id: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onToggle,
  onNewProof,
  activeChatId = "chat-1",
  onSelectChat,
}) => {
  const recentChats = [
    { id: "chat-1", title: "Theorem 25.3: Angle in Semicircle", time: "Today" },
    { id: "chat-2", title: "Cyclic Quad Supplementary Proof", time: "Yesterday" },
    { id: "chat-3", title: "Angles in Alternate Segment", time: "Previous 7 days" },
    { id: "chat-4", title: "Radius perpendicular to chord", time: "Previous 7 days" },
  ];

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
          <Link href="/workspace" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-800 tracking-tight">
              MathSense AI
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Proof Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewProof}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>New Analysis</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 px-2 tracking-wide uppercase">
              Recent Analyses
            </span>
            <div className="mt-1.5 space-y-1">
              {recentChats.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectChat && onSelectChat(item.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors truncate ${
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
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 px-2 tracking-wide uppercase">
              SL O/L Curriculum
            </span>
            <div className="mt-1.5 space-y-1 text-xs text-slate-600">
              <div className="px-2.5 py-1.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-900 flex items-center gap-2 text-[11px]">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Unit 25 & 26: Circle Theorems</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile at bottom */}
        <div className="p-3 border-t border-slate-200/70 bg-[#f9f9f9]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                KP
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight">Kasun Perera</p>
                <p className="text-[10px] text-slate-400 font-mono">Index: 219042</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;

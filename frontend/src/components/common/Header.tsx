"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";

/**
 * Top header component with official MathTutor AI logo.
 */
export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/workspace" className="flex items-center gap-2.5 group">
            <Logo size={30} className="group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              MathTutor AI
            </span>
          </Link>

          <nav className="flex items-center gap-5">
            <Link
              href="/workspace"
              className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Workspace
            </Link>
            <Link
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1.5"
              href="/recommendation"
            >
              <span>Remedial Practice</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Recommended
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

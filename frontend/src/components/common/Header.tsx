"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutDashboard, Sparkles } from "lucide-react";

/**
 * Clean application header navigation matching Khan Academy / Brilliant design standards.
 * Features clean links to Workspace and Dashboard.
 */
export const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Project Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/workspace" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    MathSense
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                  SLIIT IT4010 Research Project
                </p>
              </div>
            </Link>

            <div className="hidden lg:block h-6 w-px bg-slate-200 mx-2"></div>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>O/L Grade 11 Mathematics</span>
            </div>
          </div>

          {/* Navigation Links & Student Profile */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 text-xs font-medium">
              <Link
                href="/workspace"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === "/workspace" || pathname === "/practice" || pathname === "/"
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Workspace
              </Link>
              <Link
                href="/dashboard"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            </nav>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                KP
              </div>
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-none">Kasun P.</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Index: 219042</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

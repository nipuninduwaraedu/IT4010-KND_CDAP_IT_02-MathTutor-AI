"use client";

import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

/**
 * Top header component.
 * Clean brand navigation.
 */
export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/workspace" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              MathSense AI
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

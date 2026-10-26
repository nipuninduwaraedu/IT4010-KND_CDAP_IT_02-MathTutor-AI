"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";

// App header with logo and workspace link.
export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/workspace" className="flex items-center gap-2.5 group">
            <Logo size={30} className="group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              MathSense AI
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

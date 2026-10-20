"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/common/Header";
import { Compass, BarChart3, Award, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              Student Dashboard
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Learning Progress & Diagnostics Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kasun Perera • Index: 219042 • Sri Lankan O/L Grade 11 Mathematics
            </p>
          </div>

          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Compass className="w-4 h-4" />
            Open Practice Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Proofs Submitted</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">14</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Across 3 Circle Theorem Units</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Misconceptions Resolved</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">9</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">via Scaffolded Hints</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Deductive Proof Accuracy</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">82%</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">+14% improvement this week</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Active Syllabus Topic</p>
            <h3 className="text-sm font-bold text-slate-900 mt-2 truncate">Unit 25: Circle Theorems</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1">Theorem 25.3 & 25.4</p>
          </div>
        </div>

        {/* Practice CTA Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">Ready to Practice More Proofs?</h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl leading-relaxed">
              Upload your handwritten solutions to practice questions and receive instant misconception detection with 3-tiered scaffolded guidance.
            </p>
          </div>
          <Link
            href="/workspace"
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 text-xs font-bold shrink-0 transition-colors"
          >
            Go to Workspace &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}

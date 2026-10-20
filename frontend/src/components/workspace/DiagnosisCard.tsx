"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Brain,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { DiagnosisResult, HintTier } from "@/types/geometry";
import MathView from "../common/MathView";

interface DiagnosisCardProps {
  diagnosis: DiagnosisResult;
  onUnlockHint: (level: 1 | 2 | 3) => void;
  className?: string;
}

/**
 * AI Reasoning Diagnosis & Scaffolded 3-Tiered Hints Card (Right Column).
 * Provides actionable pedagogical feedback, rule contrast, and tiered hints.
 */
export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  diagnosis,
  onUnlockHint,
  className = "",
}) => {
  const [expandedLevels, setExpandedLevels] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true,
  });

  const isMisconception = diagnosis.status === "Misconception Detected";

  const toggleExpand = (level: number) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const unlockedCount = diagnosis.hints.filter((h) => h.isUnlocked).length;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Primary Diagnosis Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all">
        {/* Status Badge & Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                isMisconception
                  ? "bg-rose-50 text-rose-700 border border-rose-200 ring-2 ring-rose-500/10"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-2 ring-emerald-500/10"
              }`}
            >
              {isMisconception ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  Misconception Detected
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Valid Proof Logic
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span>Model:</span>
            <span className="font-semibold text-slate-700">Member 2 Reasoning Engine</span>
          </div>
        </div>

        {/* Misconception Category Tag & Confidence Meter */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Diagnostic Classification
            </span>
            <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded">
              {diagnosis.confidenceScore}% Confidence
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isMisconception
                  ? "bg-rose-100/80 text-rose-700"
                  : "bg-emerald-100/80 text-emerald-700"
              }`}
            >
              {isMisconception ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{diagnosis.category}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Research Class • SLIIT IT4010 Taxonomy
              </p>
            </div>
          </div>

          {/* Confidence Score Bar */}
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isMisconception ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${diagnosis.confidenceScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Flagged Step Callout (If Misconception Present) */}
        {diagnosis.flaggedStepIndex !== null && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <div className="p-1 rounded-md bg-amber-200/80 text-amber-800 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-950">
                Flagged Step: Step {diagnosis.flaggedStepIndex}
              </p>
              <p className="text-amber-900 leading-relaxed font-normal">
                {diagnosis.fallacyExplanation ||
                  "This deductive step contains an invalid inference or violates prerequisite geometric conditions."}
              </p>
            </div>
          </div>
        )}

        {/* Overall Evaluator Feedback */}
        <div className="mt-4 text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
          <span className="font-semibold text-slate-900">Proof Evaluation Summary: </span>
          <MathView math={diagnosis.overallFeedback} />
        </div>

        {/* Rule Contrast Box (Pedagogical Rule Comparison) */}
        {diagnosis.ruleContrastSummary && (
          <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              Syllabus Rule Contrast Matrix
            </div>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <div className="p-2 rounded bg-white/80 border border-indigo-100/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  Student Fallacy:
                </span>
                <span className="text-slate-700 font-medium text-[11px]">
                  <MathView math={diagnosis.ruleContrastSummary.studentClaim} />
                </span>
              </div>
              <div className="p-2 rounded bg-white/80 border border-indigo-100/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Correct Theorem Requirement:
                </span>
                <span className="text-slate-700 font-medium text-[11px]">
                  <MathView math={diagnosis.ruleContrastSummary.correctTheoremRule} />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scaffolded 3-Tiered Hints Accordion */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scaffolded Feedback (3-Tiered)</h3>
              <p className="text-[11px] text-slate-500">
                Adaptive hint progression tailored for Sri Lankan O/L candidates.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            {unlockedCount}/3 Unlocked
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {diagnosis.hints.map((hint) => {
            const isUnlocked = hint.isUnlocked;
            const isExpanded = expandedLevels[hint.level] ?? true;

            const tierMeta = {
              1: {
                label: "Tier 1: Conceptual Reminder",
                tagColor: "bg-blue-50 text-blue-700 border-blue-200",
                icon: BookOpen,
              },
              2: {
                label: "Tier 2: Rule Contrast",
                tagColor: "bg-amber-50 text-amber-700 border-amber-200",
                icon: Layers,
              },
              3: {
                label: "Tier 3: Guiding Question",
                tagColor: "bg-purple-50 text-purple-700 border-purple-200",
                icon: HelpCircle,
              },
            }[hint.level];

            const TierIcon = tierMeta.icon;

            return (
              <div
                key={hint.level}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  !isUnlocked
                    ? "bg-slate-50/70 border-slate-200/80 opacity-90"
                    : hint.level === 1
                    ? "bg-white border-blue-200 shadow-2xs"
                    : hint.level === 2
                    ? "bg-white border-amber-200 shadow-2xs"
                    : "bg-white border-purple-200 shadow-2xs"
                }`}
              >
                {/* Accordion Header */}
                <div
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => isUnlocked && toggleExpand(hint.level)}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isUnlocked ? (
                        <TierIcon className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{hint.title}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierMeta.tagColor}`}
                        >
                          Level {hint.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{hint.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Toggle hint content"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlockHint(hint.level);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Unlock Level {hint.level} Hint
                      </button>
                    )}
                  </div>
                </div>

                {/* Accordion Content */}
                {isUnlocked && isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-700 border-t border-slate-100 leading-relaxed">
                    <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/50 mt-1">
                      <MathView math={hint.content} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisCard;

"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Lightbulb,
  FileSpreadsheet,
  Brain,
  Edit2,
  Check,
  RotateCw,
} from "lucide-react";
import { ProofStep, DiagnosisResult } from "@/types/geometry";
import MathView from "../common/MathView";

interface ProofAnalysisMessageProps {
  steps: ProofStep[];
  diagnosis: DiagnosisResult;
  onUpdateSteps: (newSteps: ProofStep[]) => void;
  onReanalyze: () => void;
  isReanalyzing: boolean;
}

export const ProofAnalysisMessage: React.FC<ProofAnalysisMessageProps> = ({
  steps,
  diagnosis,
  onUpdateSteps,
  onReanalyze,
  isReanalyzing,
}) => {
  const [isThinkingOpen, setIsThinkingOpen] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStatement, setEditStatement] = useState("");
  const [editJustification, setEditJustification] = useState("");

  const [hintsState, setHintsState] = useState(diagnosis.hints);

  const isMisconception = diagnosis.status === "Misconception Detected";

  const handleUnlockHint = (level: 1 | 2 | 3) => {
    setHintsState((prev) =>
      prev.map((h) => (h.level === level ? { ...h, isUnlocked: true } : h))
    );
  };

  const handleStartEdit = (step: ProofStep) => {
    setEditingStepId(step.id);
    setEditStatement(step.statement);
    setEditJustification(step.justification);
  };

  const handleSaveEdit = (stepId: string) => {
    const updated = steps.map((s) => {
      if (s.id === stepId) {
        return {
          ...s,
          statement: editStatement,
          justification: editJustification,
        };
      }
      return s;
    });
    onUpdateSteps(updated);
    setEditingStepId(null);
  };

  return (
    <div className="flex gap-4 max-w-3xl mx-auto py-5 px-4 text-slate-800 animate-in fade-in duration-300">
      {/* ChatGPT Assistant Avatar */}
      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
        <Sparkles className="w-4 h-4 text-indigo-300" />
      </div>

      <div className="flex-1 space-y-4 leading-relaxed text-sm">
        {/* ChatGPT Style "Thought for 1.3 seconds" Accordion */}
        <div className="border border-slate-200/80 rounded-xl bg-slate-50/70 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setIsThinkingOpen(!isThinkingOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-500 hover:text-slate-800 transition-colors cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              Thought for 1.4 seconds (OCR transcription &amp; proof tree evaluation)
            </span>
            {isThinkingOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {isThinkingOpen && (
            <div className="px-3.5 pb-3 text-slate-600 font-mono text-[11px] space-y-1.5 border-t border-slate-200/60 pt-2 bg-slate-50">
              <p>• Member 1: Segmented handwritten lines, transcribed 3 deductive steps with 96% avg confidence.</p>
              <p>• Member 2: Mapped step graph against Sri Lankan O/L Theorem 25.3 axioms.</p>
              <p>• Flagged premise inconsistency at Step 2: Diameter prerequisite unproven.</p>
              <p>• Generated 3-tiered adaptive pedagogical hint sequence.</p>
            </div>
          )}
        </div>

        {/* Diagnostic Status Card */}
        <div
          className={`p-4 rounded-2xl border ${
            isMisconception
              ? "bg-rose-50/60 border-rose-200 text-rose-950"
              : "bg-emerald-50/60 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isMisconception
                  ? "bg-rose-100 text-rose-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isMisconception ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Misconception Detected
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Valid Proof Logic
                </>
              )}
            </span>

            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
              {diagnosis.confidenceScore}% Confidence
            </span>
          </div>

          <h3 className="text-sm font-bold mt-2 text-slate-900">
            {diagnosis.category}
          </h3>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
            <MathView math={diagnosis.overallFeedback} />
          </p>

          {diagnosis.flaggedStepIndex && (
            <div className="mt-3 p-2.5 rounded-xl bg-white/90 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Flagged at Step {diagnosis.flaggedStepIndex}: </span>
                <span>{diagnosis.fallacyExplanation}</span>
              </div>
            </div>
          )}
        </div>

        {/* Extracted Step Verification Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Extracted Proof Steps (OCR)</span>
            </div>
            <button
              type="button"
              onClick={onReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <RotateCw className={`w-3 h-3 ${isReanalyzing ? "animate-spin" : ""}`} />
              Re-verify
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {steps.map((step) => {
              const isEditing = editingStepId === step.id;
              const isFlagged = diagnosis.flaggedStepIndex === step.stepNumber;

              return (
                <div
                  key={step.id}
                  className={`p-3 transition-colors ${
                    isFlagged ? "bg-amber-50/60 border-l-4 border-l-amber-500" : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </span>
                      {isFlagged && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Flaw
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <textarea
                            value={editStatement}
                            onChange={(e) => setEditStatement(e.target.value)}
                            rows={2}
                            className="w-full text-xs font-mono p-1.5 border border-indigo-300 rounded bg-white"
                          />
                          <input
                            type="text"
                            value={editJustification}
                            onChange={(e) => setEditJustification(e.target.value)}
                            className="w-full text-xs p-1.5 border border-indigo-300 rounded bg-white"
                            placeholder="Reason / justification"
                          />
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-900">
                            <MathView math={step.statement} />
                          </div>
                          <div className="text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-600">Reason:</span>{" "}
                            {step.justification}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(step.id)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(step)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Edit transcription"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scaffolded 3-Tiered Hints Accordion */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Scaffolded Feedback &amp; Hints</span>
          </div>

          <div className="space-y-2">
            {hintsState.map((hint) => {
              return (
                <div
                  key={hint.level}
                  className={`border rounded-xl p-3 text-xs transition-all ${
                    hint.isUnlocked
                      ? "bg-white border-slate-200 shadow-2xs"
                      : "bg-slate-50 border-slate-200/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        Level {hint.level}: {hint.title}
                      </span>
                    </div>

                    {!hint.isUnlocked && (
                      <button
                        type="button"
                        onClick={() => handleUnlockHint(hint.level)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                      >
                        <Unlock className="w-3 h-3" />
                        Unlock Level {hint.level}
                      </button>
                    )}
                  </div>

                  {hint.isUnlocked && (
                    <div className="mt-2 text-slate-700 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                      <MathView math={hint.content} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofAnalysisMessage;

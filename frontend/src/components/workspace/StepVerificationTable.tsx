"use client";

import React, { useState } from "react";
import {
  Check,
  Edit2,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { ProofStep } from "@/types/geometry";
import MathView from "../common/MathView";

interface StepVerificationTableProps {
  steps: ProofStep[];
  onUpdateSteps: (newSteps: ProofStep[]) => void;
  onReanalyze: () => void;
  isAnalyzing: boolean;
  flaggedStepIndex: number | null;
}

/**
 * Step Verification Section displaying OCR-extracted reasoning steps.
 * Provides inline editing so students can correct transcription typos before or after inference.
 */
export const StepVerificationTable: React.FC<StepVerificationTableProps> = ({
  steps,
  onUpdateSteps,
  onReanalyze,
  isAnalyzing,
  flaggedStepIndex,
}) => {
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStatement, setEditStatement] = useState("");
  const [editJustification, setEditJustification] = useState("");

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

  const handleCancelEdit = () => {
    setEditingStepId(null);
  };

  const handleDeleteStep = (stepId: string) => {
    const remaining = steps.filter((s) => s.id !== stepId);
    // Renumber steps
    const renumbered = remaining.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
    }));
    onUpdateSteps(renumbered);
  };

  const handleAddStep = () => {
    const newStepNum = steps.length + 1;
    const newStep: ProofStep = {
      id: `step-${Date.now()}`,
      stepNumber: newStepNum,
      statement: "In \\triangle ABC, \\; ...",
      justification: "Geometric axiom",
      ocrConfidence: 99,
      isFlagged: false,
    };
    onUpdateSteps([...steps, newStep]);
    handleStartEdit(newStep);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden mt-6">
      {/* Table Header / Ingestion Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Extracted Step Verification & Ingestion
            </h3>
            <p className="text-[11px] text-slate-500">
              Review and correct OCR-transcribed reasoning steps before or after AI diagnosis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            Add Step
          </button>
          <button
            type="button"
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
            Re-verify Steps
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4 w-16">Step</th>
              <th className="py-2.5 px-4">Mathematical Statement</th>
              <th className="py-2.5 px-4 w-52">Justification / Reason</th>
              <th className="py-2.5 px-3 w-24 text-center">OCR Match</th>
              <th className="py-2.5 px-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {steps.map((step) => {
              const isEditing = editingStepId === step.id;
              const isFlagged = flaggedStepIndex === step.stepNumber;

              return (
                <tr
                  key={step.id}
                  className={`transition-colors duration-150 ${
                    isFlagged
                      ? "bg-amber-50/70 border-l-4 border-l-amber-500"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Step Number */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-semibold ${
                          isFlagged
                            ? "bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-400/30"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      {isFlagged && (
                        <span title="Reasoning step flagged with misconception">
                          <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Statement */}
                  <td className="py-3 px-4 align-top">
                    {isEditing ? (
                      <textarea
                        value={editStatement}
                        onChange={(e) => setEditStatement(e.target.value)}
                        rows={2}
                        className="w-full text-xs font-mono p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        placeholder="Statement (LaTeX supported, e.g. \angle ACB = 90^\circ)"
                      />
                    ) : (
                      <div className="space-y-1">
                        <div className="text-slate-800 font-medium leading-relaxed">
                          <MathView math={step.statement} />
                        </div>
                        {isFlagged && step.flagReason && (
                          <div className="text-[11px] text-amber-800 bg-amber-100/70 p-2 rounded-md border border-amber-200 flex items-start gap-1.5 mt-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{step.flagReason}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Justification */}
                  <td className="py-3 px-4 align-top">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editJustification}
                        onChange={(e) => setEditJustification(e.target.value)}
                        className="w-full text-xs p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        placeholder="Reason / Theorem name"
                      />
                    ) : (
                      <span className="inline-block text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-200/60">
                        {step.justification}
                      </span>
                    )}
                  </td>

                  {/* OCR Confidence */}
                  <td className="py-3 px-3 align-top text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                        (step.ocrConfidence || 95) >= 95
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {step.ocrConfidence || 95}%
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(step.id)}
                          className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors"
                          title="Save step edit"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-md transition-colors text-xs font-semibold px-2"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(step)}
                          className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit step transcription"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteStep(step.id)}
                            className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Verification footer notes */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          OCR steps are aligned with graph neural reasoning in Member 2.
        </span>
        <span className="font-mono">{steps.length} Deductive Steps Logged</span>
      </div>
    </div>
  );
};

export default StepVerificationTable;

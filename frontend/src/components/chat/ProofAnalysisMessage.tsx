"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Unlock,
  Lightbulb,
  FileSpreadsheet,
  BookOpen,
} from "lucide-react";
import { AnalyzeProofResponse } from "@/types/api";
import MathView from "../common/MathView";
import Logo from "../common/Logo";

interface ProofAnalysisMessageProps {
  response: AnalyzeProofResponse;
}

/**
 * Renders the real model response from the FastAPI backend gateway.
 * Displays extracted steps, prediction misconception classification,
 * flagged step highlight, 3-tiered hints, and remedial guidance.
 */
export const ProofAnalysisMessage: React.FC<ProofAnalysisMessageProps> = ({
  response,
}) => {
  const { submission_id, extracted_steps, prediction, feedback, remedial_guidance } =
    response;

  // Track unlocking of scaffolded feedback hints
  const [unlockedLevels, setUnlockedLevels] = useState<{ [key: number]: boolean }>({
    1: true, // Level 1 visible by default
    2: false,
    3: false,
  });

  const isCorrect = prediction?.misconception_category === "Correct Reasoning";
  const confidencePercent = prediction?.confidence_score
    ? Math.round(
        prediction.confidence_score > 1
          ? prediction.confidence_score
          : prediction.confidence_score * 100
      )
    : null;

  const unlockLevel = (level: number) => {
    setUnlockedLevels((prev) => ({ ...prev, [level]: true }));
  };

  return (
    <div className="flex gap-4 max-w-3xl mx-auto py-5 px-4 text-slate-800 animate-in fade-in duration-300">
      {/* Assistant Logo Avatar */}
      <div className="shrink-0 mt-0.5">
        <Logo size={32} />
      </div>

      <div className="flex-1 space-y-5 leading-relaxed text-sm">
        {/* Submission ID & Status Tag */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Submission ID: {submission_id}</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Analysis Complete
          </span>
        </div>

        {/* 1. Diagnostic Prediction Card */}
        {prediction && (
          <div
            className={`p-4 rounded-2xl border ${
              isCorrect
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-rose-50/70 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isCorrect
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Valid Proof Logic
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Misconception Detected
                  </>
                )}
              </span>

              {confidencePercent !== null && (
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-700">
                  {confidencePercent}% Confidence
                </span>
              )}
            </div>

            <h3 className="text-base font-bold mt-2 text-slate-900">
              {prediction.misconception_category}
            </h3>

            {prediction.flagged_step_index && (
              <div className="mt-3 p-3 rounded-xl bg-white/90 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    Flagged Inconsistency at Step {prediction.flagged_step_index}:
                  </span>
                  <p className="mt-0.5 text-rose-800 leading-relaxed font-normal">
                    This step failed deductive validation against geometric theorem preconditions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Extracted Step Verification Table */}
        {extracted_steps && extracted_steps.length > 0 && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Extracted Proof Steps ({extracted_steps.length})</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                OCR Pipeline Output
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {extracted_steps.map((step) => {
                const isFlagged =
                  step.is_flagged ||
                  (prediction?.flagged_step_index !== null &&
                    step.step_number === prediction?.flagged_step_index);

                return (
                  <div
                    key={step.step_number}
                    className={`p-3.5 transition-colors ${
                      isFlagged
                        ? "bg-amber-50/70 border-l-4 border-l-amber-500"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        <span
                          className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center ${
                            isFlagged
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {step.step_number}
                        </span>
                        {isFlagged && (
                          <span
                            className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded"
                            title="Step flagged with logical fallacy"
                          >
                            Flawed
                          </span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-slate-900 leading-relaxed">
                          <MathView math={step.statement} />
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-600">Reason:</span>{" "}
                          <MathView math={step.justification} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Scaffolded 3-Tiered Hints */}
        {feedback && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Scaffolded Feedback &amp; Hints</span>
            </div>

            <div className="space-y-2.5">
              {/* Level 1: Conceptual Reminder */}
              {feedback.level_1_hint && (
                <div className="border border-blue-200 rounded-xl p-3.5 text-xs bg-white shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Level 1: Conceptual Reminder
                    </span>
                  </div>
                  <div className="text-slate-800 leading-relaxed">
                    <MathView math={feedback.level_1_hint} />
                  </div>
                </div>
              )}

              {/* Level 2: Rule Contrast */}
              {feedback.level_2_hint && (
                <div className="border border-amber-200 rounded-xl p-3.5 text-xs bg-white shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Level 2: Rule Contrast
                    </span>

                    {!unlockedLevels[2] && (
                      <button
                        type="button"
                        onClick={() => unlockLevel(2)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-colors"
                      >
                        <Unlock className="w-3 h-3" />
                        Unlock Level 2
                      </button>
                    )}
                  </div>

                  {unlockedLevels[2] && (
                    <div className="mt-2 text-slate-800 leading-relaxed bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                      <MathView math={feedback.level_2_hint} />
                    </div>
                  )}
                </div>
              )}

              {/* Level 3: Guiding Question */}
              {feedback.level_3_guiding_question && (
                <div className="border border-purple-200 rounded-xl p-3.5 text-xs bg-white shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Level 3: Guiding Question
                    </span>

                    {!unlockedLevels[3] && (
                      <button
                        type="button"
                        onClick={() => unlockLevel(3)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-colors"
                      >
                        <Unlock className="w-3 h-3" />
                        Unlock Level 3
                      </button>
                    )}
                  </div>

                  {unlockedLevels[3] && (
                    <div className="mt-2 text-slate-800 leading-relaxed bg-purple-50/60 p-2.5 rounded-lg border border-purple-100">
                      <MathView math={feedback.level_3_guiding_question} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Remedial Guidance (When provided by backend) */}
        {remedial_guidance && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Remedial Topic: {remedial_guidance.topic}</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-5">
              <MathView math={remedial_guidance.recommendation_note} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProofAnalysisMessage;

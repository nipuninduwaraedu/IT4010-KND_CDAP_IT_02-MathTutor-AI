"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, Brain, Cpu, FileScan } from "lucide-react";

interface PipelineStatusModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

/**
 * Visual modal tracking the simulated Member 1 (OCR Extraction) to
 * Member 2 (Reasoning Engine & Hint Scaffolding) API pipeline stages.
 */
export const PipelineStatusModal: React.FC<PipelineStatusModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    {
      title: "Member 1: Preprocessing & Image Normalization",
      detail: "Binarizing canvas strokes, deskewing handwritten proof sheet, and isolating step bounding boxes.",
      icon: FileScan,
    },
    {
      title: "Member 1: Mathematical Formula OCR & Step Extraction",
      detail: "Transcribing LaTeX notation for angles (∠), diameter chords (AB), and deductive step reasons.",
      icon: Cpu,
    },
    {
      title: "Member 2: Proof Tree Construction & Graph Alignment",
      detail: "Building semantic proof graph and verifying theorem preconditions against Sri Lanka O/L axioms.",
      icon: Brain,
    },
    {
      title: "Member 2: Misconception Classification & Hint Scaffolding",
      detail: "Categorizing logical fallacies and compiling 3-tiered adaptive pedagogical hints.",
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      return;
    }

    const t1 = setTimeout(() => setCurrentStage(1), 400);
    const t2 = setTimeout(() => setCurrentStage(2), 900);
    const t3 = setTimeout(() => setCurrentStage(3), 1400);
    const t4 = setTimeout(() => {
      setCurrentStage(4);
      setTimeout(() => {
        onComplete();
      }, 400);
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-700 rounded-lg">
              <Brain className="w-5 h-5 text-indigo-200" />
            </span>
            <div>
              <h3 className="text-base font-bold">Deductive Pipeline In Progress</h3>
              <p className="text-xs text-indigo-200">SLIIT IT4010 Research Inference Engine</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {stages.map((stage, idx) => {
            const isCompleted = currentStage > idx;
            const isCurrent = currentStage === idx;
            const StageIcon = stage.icon;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isCurrent
                    ? "bg-indigo-50/80 border border-indigo-200/80 scale-[1.01]"
                    : isCompleted
                    ? "bg-slate-50 border border-slate-100 opacity-90"
                    : "opacity-40"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  ) : (
                    <StageIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="text-xs">
                  <p
                    className={`font-bold ${
                      isCurrent
                        ? "text-indigo-950 font-semibold"
                        : isCompleted
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {stage.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 text-center text-xs text-slate-500 font-mono">
          Simulating Member 1 (OCR) &rarr; Member 2 (Reasoning & Scaffolding)
        </div>
      </div>
    </div>
  );
};

export default PipelineStatusModal;

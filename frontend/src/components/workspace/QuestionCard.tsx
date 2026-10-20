"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import MathView from "../common/MathView";
import GeometryDiagram from "./GeometryDiagram";

interface QuestionCardProps {
  flaggedStepIndex?: number | null;
}

/**
 * Question Context Card displaying the Grade 11 Sri Lankan O/L Circle Theorem problem statement
 * and the interactive geometric diagram.
 */
export const QuestionCard: React.FC<QuestionCardProps> = ({ flaggedStepIndex }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Header with syllabus tag */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            SL O/L Grade 11 Mathematics
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
            Unit 25: Circle Theorems
          </span>
        </div>
        <div className="text-xs text-slate-400 font-mono">Q.Code: MATH-11-25.3</div>
      </div>

      <div className="p-5 space-y-4">
        {/* Problem Statement */}
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Theorem 25.3: Angle in a Semicircle
          </h2>
          <div className="mt-2.5 text-sm leading-relaxed text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <p className="font-medium text-slate-800">
              <span className="font-bold text-indigo-950">Problem Statement: </span>
              In the circle with center <MathView math="O" />, line segment{" "}
              <MathView math="AB" /> is a diameter and point <MathView math="C" /> is on the
              circumference.
            </p>
            <div className="mt-2 pl-3.5 border-l-2 border-indigo-600 text-indigo-950 font-semibold text-sm">
              Prove that <MathView math="\angle ACB = 90^\circ" />.
            </div>
          </div>
        </div>

        {/* Geometry Diagram */}
        <GeometryDiagram flaggedStepIndex={flaggedStepIndex} />
      </div>
    </div>
  );
};

export default QuestionCard;

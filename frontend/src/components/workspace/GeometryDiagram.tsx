"use client";

import React, { useState } from "react";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import MathView from "../common/MathView";

interface GeometryDiagramProps {
  className?: string;
  flaggedStepIndex?: number | null;
}

/**
 * Geometric SVG Diagram for O/L Grade 11 Circle Theorem (Angle in a Semicircle).
 * Features toggleable auxiliary constructions (radius OC) and angle highlights.
 */
export const GeometryDiagram: React.FC<GeometryDiagramProps> = ({
  className = "",
  flaggedStepIndex,
}) => {
  const [showAuxiliary, setShowAuxiliary] = useState(true);
  const [highlightAngle, setHighlightAngle] = useState(true);
  const [showRadiusLabels, setShowRadiusLabels] = useState(false);

  // Geometric coordinates for 340x260 viewport
  const cx = 170;
  const cy = 140;
  const r = 100;

  // A: Left end of diameter (180 deg)
  const ax = cx - r; // 70
  const ay = cy; // 140

  // B: Right end of diameter (0 deg)
  const bx = cx + r; // 270
  const by = cy; // 140

  // C: Circumference point at roughly 65 deg from positive x-axis (upwards)
  // In SVG coords, y decreases going up: angle 125 deg counter-clockwise from right
  const angleRad = (55 * Math.PI) / 180;
  const cxPt = cx + r * Math.cos(angleRad); // ~ 227
  const cyPt = cy - r * Math.sin(angleRad); // ~ 58

  return (
    <div className={`flex flex-col items-center bg-white border border-slate-200 rounded-xl p-4 shadow-xs ${className}`}>
      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Figure 25.3: Circle with Center O
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAuxiliary(!showAuxiliary)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
              showAuxiliary
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Toggle auxiliary construction radius OC"
          >
            {showAuxiliary ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Radius OC
          </button>
          <button
            type="button"
            onClick={() => setShowRadiusLabels(!showRadiusLabels)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
              showRadiusLabels
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Display radii equal markers"
          >
            {showRadiusLabels ? "Radii (r)" : "Mark r"}
          </button>
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="relative w-full max-w-[340px] aspect-[340/250] flex items-center justify-center my-2 select-none">
        <svg
          viewBox="0 0 340 250"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shading for triangle ABC */}
            <linearGradient id="triangleFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background grid dots for technical blueprint feel */}
          <pattern id="dotPattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="#e2e8f0" />
          </pattern>
          <rect width="340" height="250" fill="url(#dotPattern)" rx="8" />

          {/* Main Circle */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="none"
          />

          {/* Upper semicircle highlight */}
          <path
            d={`M ${ax} ${ay} A ${r} ${r} 0 0 1 ${bx} ${by}`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeOpacity="0.3"
          />

          {/* Triangle ABC filled interior */}
          <polygon
            points={`${ax},${ay} ${cxPt},${cyPt} ${bx},${by}`}
            fill="url(#triangleFill)"
            stroke="none"
          />

          {/* Diameter AB */}
          <line
            x1={ax}
            y1={ay}
            x2={bx}
            y2={by}
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Chord AC */}
          <line
            x1={ax}
            y1={ay}
            x2={cxPt}
            y2={cyPt}
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Chord BC */}
          <line
            x1={bx}
            y1={by}
            x2={cxPt}
            y2={cyPt}
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Auxiliary Radius OC */}
          {showAuxiliary && (
            <>
              <line
                x1={cx}
                y1={cy}
                x2={cxPt}
                y2={cyPt}
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="4 3"
                className="transition-all duration-300"
              />
              <text
                x={(cx + cxPt) / 2 - 12}
                y={(cy + cyPt) / 2}
                fill="#b45309"
                fontSize="11"
                fontWeight="600"
                className="select-none"
              >
                r
              </text>
            </>
          )}

          {/* Angle at C highlight / marker */}
          {highlightAngle && (
            <g>
              {/* Subtle right-angle symbol aligned with chords AC and BC */}
              <circle
                cx={cxPt}
                cy={cyPt}
                r="16"
                fill="#f59e0b"
                fillOpacity="0.15"
                stroke="#d97706"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <text
                x={cxPt - 4}
                y={cyPt + 28}
                fill="#92400e"
                fontSize="10"
                fontWeight="700"
              >
                90°?
              </text>
            </g>
          )}

          {/* Radius labels on OA and OB */}
          {showRadiusLabels && (
            <>
              <text
                x={(ax + cx) / 2}
                y={cy + 16}
                fill="#475569"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                r (radius)
              </text>
              <text
                x={(bx + cx) / 2}
                y={cy + 16}
                fill="#475569"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                r (radius)
              </text>
            </>
          )}

          {/* Vertex Points & Labels */}
          {/* Center O */}
          <circle cx={cx} cy={cy} r="4" fill="#0f172a" />
          <circle cx={cx} cy={cy} r="7" fill="none" stroke="#0f172a" strokeWidth="1" />
          <text
            x={cx}
            y={cy - 10}
            fill="#0f172a"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            O
          </text>

          {/* Point A */}
          <circle cx={ax} cy={ay} r="4" fill="#2563eb" />
          <text
            x={ax - 14}
            y={ay + 5}
            fill="#1e293b"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            A
          </text>

          {/* Point B */}
          <circle cx={bx} cy={by} r="4" fill="#2563eb" />
          <text
            x={bx + 14}
            y={by + 5}
            fill="#1e293b"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            B
          </text>

          {/* Point C */}
          <circle cx={cxPt} cy={cyPt} r="4.5" fill="#ea580c" />
          <text
            x={cxPt + 12}
            y={cyPt - 4}
            fill="#c2410c"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            C
          </text>
        </svg>
      </div>

      {/* Diagram Footer Annotation */}
      <div className="w-full flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-slate-800"></span>
            Diameter <MathView math="AB" />
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-600"></span>
            Chords <MathView math="AC, BC" />
          </span>
          {showAuxiliary && (
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-3 h-0.5 border-t border-dashed border-amber-600"></span>
              Auxiliary <MathView math="OC" />
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-slate-400">Sri Lanka O/L Grade 11</span>
      </div>
    </div>
  );
};

export default GeometryDiagram;

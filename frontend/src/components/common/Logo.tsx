"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "mark" | "full";
}

/**
 * MathSense AI System Logo Component.
 * Features the geometric proof triangle with neural nodes and angle arc.
 */
export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = 32,
  variant = "mark",
}) => {
  if (variant === "full") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width={size * 3.5}
        height={size}
        className={`overflow-visible select-none ${className}`}
      >
        <defs>
          <radialGradient id="logoBgGlow" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0B0F19" />
          </radialGradient>
          <linearGradient id="logoPrimaryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="logoAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id="logoNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="512" height="512" rx="96" fill="url(#logoBgGlow)" />
        <rect
          width="508"
          height="508"
          x="2"
          y="2"
          rx="94"
          fill="none"
          stroke="#334155"
          strokeWidth="2"
          strokeOpacity="0.4"
        />

        <g transform="translate(0, -25)">
          <circle
            cx="256"
            cy="220"
            r="145"
            fill="none"
            stroke="#334155"
            strokeWidth="2.5"
            strokeDasharray="6 8"
            opacity="0.6"
          />
          <path
            d="M 222 284 A 42 42 0 0 0 274 278"
            fill="none"
            stroke="url(#logoAccentGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            filter="url(#logoNeonGlow)"
          />
          <line
            x1="256"
            y1="100"
            x2="256"
            y2="295"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
          <polygon
            points="256,100 380,295 132,295"
            fill="none"
            stroke="url(#logoPrimaryGrad)"
            strokeWidth="14"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#logoNeonGlow)"
          />
          <circle cx="256" cy="220" r="7" fill="url(#logoAccentGrad)" filter="url(#logoNeonGlow)" />
          <circle
            cx="256"
            cy="100"
            r="11"
            fill="#0B0F19"
            stroke="#38BDF8"
            strokeWidth="4.5"
            filter="url(#logoNeonGlow)"
          />
          <circle cx="256" cy="100" r="4" fill="#FFFFFF" />
          <circle
            cx="380"
            cy="295"
            r="11"
            fill="#0B0F19"
            stroke="#818CF8"
            strokeWidth="4.5"
            filter="url(#logoNeonGlow)"
          />
          <circle cx="380" cy="295" r="4" fill="#FFFFFF" />
          <circle
            cx="132"
            cy="295"
            r="11"
            fill="#0B0F19"
            stroke="#2563EB"
            strokeWidth="4.5"
            filter="url(#logoNeonGlow)"
          />
          <circle cx="132" cy="295" r="4" fill="#FFFFFF" />
        </g>

        <g transform="translate(0, 395)">
          <text
            x="210"
            y="0"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif"
            fontSize="44"
            fontWeight="800"
            fill="#F8FAFC"
            textAnchor="middle"
            letterSpacing="-1"
          >
            MathSense
          </text>
          <g transform="translate(325, -34)">
            <rect width="64" height="34" rx="8" fill="url(#logoPrimaryGrad)" />
            <text
              x="32"
              y="23"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif"
              fontSize="19"
              fontWeight="800"
              fill="#FFFFFF"
              textAnchor="middle"
              letterSpacing="1"
            >
              AI
            </text>
          </g>
          <text
            x="256"
            y="32"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif"
            fontSize="15"
            fontWeight="600"
            fill="#94A3B8"
            textAnchor="middle"
            letterSpacing="2.5"
          >
            GEOMETRY DIAGNOSTIC TUTOR
          </text>
        </g>
      </svg>
    );
  }

  // Variant "mark" (Emblem-only for icons, avatars, and headers)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`select-none shrink-0 ${className}`}
    >
      <defs>
        <radialGradient id={`markBgGlow-${size}`} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0B0F19" />
        </radialGradient>
        <linearGradient id={`markPrimaryGrad-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id={`markAccentGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <filter id={`markNeonGlow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="512" height="512" rx="100" fill={`url(#markBgGlow-${size})`} />
      <rect
        width="508"
        height="508"
        x="2"
        y="2"
        rx="98"
        fill="none"
        stroke="#334155"
        strokeWidth="3"
        strokeOpacity="0.4"
      />

      <g transform="translate(0, 35)">
        <circle
          cx="256"
          cy="220"
          r="145"
          fill="none"
          stroke="#334155"
          strokeWidth="3"
          strokeDasharray="6 8"
          opacity="0.6"
        />
        <path
          d="M 222 284 A 42 42 0 0 0 274 278"
          fill="none"
          stroke={`url(#markAccentGrad-${size})`}
          strokeWidth="5"
          strokeLinecap="round"
          filter={`url(#markNeonGlow-${size})`}
        />
        <line
          x1="256"
          y1="100"
          x2="256"
          y2="295"
          stroke="#475569"
          strokeWidth="2.5"
          strokeDasharray="4 6"
        />
        <polygon
          points="256,100 380,295 132,295"
          fill="none"
          stroke={`url(#markPrimaryGrad-${size})`}
          strokeWidth="16"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={`url(#markNeonGlow-${size})`}
        />
        <circle
          cx="256"
          cy="220"
          r="8"
          fill={`url(#markAccentGrad-${size})`}
          filter={`url(#markNeonGlow-${size})`}
        />
        <circle
          cx="256"
          cy="100"
          r="12"
          fill="#0B0F19"
          stroke="#38BDF8"
          strokeWidth="4.5"
          filter={`url(#markNeonGlow-${size})`}
        />
        <circle cx="256" cy="100" r="4.5" fill="#FFFFFF" />
        <circle
          cx="380"
          cy="295"
          r="12"
          fill="#0B0F19"
          stroke="#818CF8"
          strokeWidth="4.5"
          filter={`url(#markNeonGlow-${size})`}
        />
        <circle cx="380" cy="295" r="4.5" fill="#FFFFFF" />
        <circle
          cx="132"
          cy="295"
          r="12"
          fill="#0B0F19"
          stroke="#2563EB"
          strokeWidth="4.5"
          filter={`url(#markNeonGlow-${size})`}
        />
        <circle cx="132" cy="295" r="4.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

export default Logo;

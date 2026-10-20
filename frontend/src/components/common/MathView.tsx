"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathViewProps {
  math?: string;
  children?: string;
  display?: boolean;
  className?: string;
}

/**
 * Renders mathematical formulas and notation using KaTeX.
 * Handles both pure TeX expressions and text with embedded $...$ delimiters.
 */
export const MathView: React.FC<MathViewProps> = ({
  math,
  children,
  display = false,
  className = "",
}) => {
  const content = (math || children || "").trim();

  const renderedHtml = useMemo(() => {
    if (!content) return "";

    // If the string starts and ends with $ or contains no $, treat it as pure math if it has LaTeX symbols
    const hasLatexCommands = /\\[a-zA-Z]+|\^|_|\{/.test(content);
    const hasDollarDelimiters = content.includes("$");

    if (!hasDollarDelimiters && (hasLatexCommands || display)) {
      try {
        return katex.renderToString(content, {
          displayMode: display,
          throwOnError: false,
        });
      } catch {
        return content;
      }
    }

    if (hasDollarDelimiters) {
      // Split by $...$ inline math
      const parts = content.split(/(\$[^$]+\$)/g);
      return parts
        .map((part) => {
          if (part.startsWith("$") && part.endsWith("$")) {
            const inner = part.slice(1, -1);
            try {
              return katex.renderToString(inner, {
                displayMode: false,
                throwOnError: false,
              });
            } catch {
              return part;
            }
          }
          // Escape HTML characters in plain text segments
          return part
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        })
        .join("");
    }

    // Default plain text or simple angle symbol handling
    if (content.includes("∠") || content.includes("°") || content.includes("Δ")) {
      const converted = content
        .replace(/∠\s*([A-Za-z0-9]+)/g, "\\angle $1")
        .replace(/Δ\s*([A-Za-z0-9]+)/g, "\\triangle $1")
        .replace(/([0-9]+)°/g, "$1^\\circ");

      try {
        return katex.renderToString(converted, {
          displayMode: display,
          throwOnError: false,
        });
      } catch {
        return content;
      }
    }

    return content;
  }, [content, display]);

  return (
    <span
      className={`inline-block font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

export default MathView;

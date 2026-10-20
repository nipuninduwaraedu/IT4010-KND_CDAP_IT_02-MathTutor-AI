/**
 * Domain types for the SLIIT IT4010 Research Project:
 * "Intelligent Misconception Detection and Personalized Learning Support System for O/L Mathematics Students"
 *
 * Models the Member 1 (OCR/Step Extraction) -> Member 2 (Reasoning Engine & Hint Scaffolding) contracts.
 */

export type MisconceptionCategory =
  | "Incorrect Theorem Application"
  | "Incorrect Angle Relationships"
  | "Missing Proof Step"
  | "Correct Reasoning";

export interface ProofStep {
  id: string;
  stepNumber: number;
  statement: string;
  justification: string;
  ocrConfidence?: number;
  isFlagged?: boolean;
  flagReason?: string;
}

export interface HintTier {
  level: 1 | 2 | 3;
  title: string;
  subtitle: string;
  content: string;
  isUnlocked: boolean;
  pedagogicalFocus: "Conceptual Reminder" | "Rule Contrast" | "Guiding Question";
}

export interface DiagnosisResult {
  status: "Misconception Detected" | "Valid Proof Logic";
  category: MisconceptionCategory;
  confidenceScore: number;
  flaggedStepIndex: number | null; // 1-based index or null if correct
  overallFeedback: string;
  fallacyExplanation?: string;
  ruleContrastSummary?: {
    studentClaim: string;
    correctTheoremRule: string;
    missingRequirement: string;
  };
  hints: HintTier[];
}

export interface ProblemCase {
  id: string;
  grade: string;
  topic: string;
  subtopic: string;
  title: string;
  statementText: string;
  katexStatement: string;
  diagramConfig: {
    circleRadius: number;
    points: {
      A: { x: number; y: number; label: string };
      B: { x: number; y: number; label: string };
      C: { x: number; y: number; label: string };
      O: { x: number; y: number; label: string };
    };
  };
  sampleSubmissions: {
    id: string;
    label: string;
    category: MisconceptionCategory;
    description: string;
    rawText: string;
    steps: ProofStep[];
    diagnosis: DiagnosisResult;
  }[];
}

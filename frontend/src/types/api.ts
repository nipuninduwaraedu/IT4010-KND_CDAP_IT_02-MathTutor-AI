/**
 * Live Backend API Integration Contracts
 * SLIIT Final Year Research Project (IT4010)
 *
 * Backend Gateway: POST /api/v1/analyze-proof
 */

export type MisconceptionCategory =
  | "Incorrect Theorem Application"
  | "Incorrect Angle Relationships"
  | "Missing Proof Step"
  | "Correct Reasoning"
  | string;

export interface ExtractedStep {
  step_number: number;
  statement: string;
  justification: string;
  is_flagged: boolean;
}

export interface PredictionResult {
  misconception_category: MisconceptionCategory;
  confidence_score: number; // e.g., 0.89
  flagged_step_index: number | null; // e.g., 2 or null
}

export interface ScaffoldedFeedback {
  level_1_hint: string;
  level_2_hint: string;
  level_3_guiding_question: string;
}

export interface RemedialGuidance {
  topic: string;
  recommendation_note: string;
}

export interface AnalyzeProofResponse {
  submission_id: string;
  extracted_steps: ExtractedStep[];
  prediction: PredictionResult;
  feedback: ScaffoldedFeedback;
  remedial_guidance?: RemedialGuidance;
}

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  status_code?: number;
}

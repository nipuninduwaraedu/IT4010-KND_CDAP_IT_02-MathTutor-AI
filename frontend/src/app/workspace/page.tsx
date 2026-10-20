"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import QuestionCard from "@/components/workspace/QuestionCard";
import SubmissionCard from "@/components/workspace/SubmissionCard";
import StepVerificationTable from "@/components/workspace/StepVerificationTable";
import DiagnosisCard from "@/components/workspace/DiagnosisCard";
import { SAMPLE_PROBLEM } from "@/data/mockData";
import { ProofStep, DiagnosisResult } from "@/types/geometry";
import { Brain, FileSearch, Sparkles, Loader2, RotateCcw } from "lucide-react";

export default function WorkspacePage() {
  // Submission input states (null on initial load)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string>("");

  // Two-state workflow control
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Results state (populated ONLY upon submission)
  const defaultCase = SAMPLE_PROBLEM.sampleSubmissions[0];
  const [currentSteps, setCurrentSteps] = useState<ProofStep[]>(defaultCase.steps);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult>(
    JSON.parse(JSON.stringify(defaultCase.diagnosis))
  );

  // File selection handler
  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setUploadedFile(file);
    setImagePreviewUrl(previewUrl);
    // If user removes the file, keep result state clean
    if (!file) {
      setHasSubmitted(false);
    }
  };

  // Trigger analysis pipeline
  const handleAnalyzeProof = (submission: {
    type: "image" | "text";
    content: string;
    file?: File;
  }) => {
    setIsAnalyzing(true);
    setHasSubmitted(false);

    // Realistic API pipeline latency (1.4s)
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasSubmitted(true);
    }, 1400);
  };

  // Re-verify reasoning after student edits transcription steps
  const handleReanalyzeFromTable = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 900);
  };

  // Reset to initial empty state
  const handleResetToEmpty = () => {
    setUploadedFile(null);
    setImagePreviewUrl(null);
    setManualText("");
    setHasSubmitted(false);
    setIsAnalyzing(false);
  };

  // Scaffolded hint unlocker
  const handleUnlockHint = (level: 1 | 2 | 3) => {
    setCurrentDiagnosis((prev) => ({
      ...prev,
      hints: prev.hints.map((h) =>
        h.level === level ? { ...h, isUnlocked: true } : h
      ),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header Navigation */}
      <Header />

      {/* Workspace Subheader */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Practice & Diagnostic Workspace
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                SLIIT IT4010 Research
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Circle Theorems: Step Verification & AI Diagnosis
            </h1>
          </div>

          {hasSubmitted && (
            <button
              type="button"
              onClick={handleResetToEmpty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Submit Another Proof
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Split Screen Workbench */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Problem Context, Prominent Input Upload, & Conditional Verification Table (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Problem Statement & Geometry Diagram */}
            <QuestionCard
              flaggedStepIndex={hasSubmitted ? currentDiagnosis.flaggedStepIndex : null}
            />

            {/* 2. Prominent Upload Box (Image Dropzone + Optional Viva Text) */}
            <SubmissionCard
              onAnalyze={handleAnalyzeProof}
              isAnalyzing={isAnalyzing}
              uploadedFile={uploadedFile}
              imagePreviewUrl={imagePreviewUrl}
              onFileSelect={handleFileSelect}
              manualText={manualText}
              setManualText={setManualText}
            />

            {/* 3. Extracted Step Verification Table (REVEALED ONLY AFTER SUBMISSION) */}
            {hasSubmitted && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <StepVerificationTable
                  steps={currentSteps}
                  onUpdateSteps={setCurrentSteps}
                  onReanalyze={handleReanalyzeFromTable}
                  isAnalyzing={isAnalyzing}
                  flaggedStepIndex={currentDiagnosis.flaggedStepIndex}
                />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Conditional Rendering (5 cols) */}
          <div className="lg:col-span-5 sticky top-20">
            {/* State A: Analyzing / Loading State */}
            {isAnalyzing && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Analyzing Geometry Proof
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Processing handwriting with OCR... Running misconception classifier...
                  </p>
                </div>
                <div className="w-48 mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            )}

            {/* State B: Result State (Triggered ONLY after submission) */}
            {!isAnalyzing && hasSubmitted && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <DiagnosisCard
                  diagnosis={currentDiagnosis}
                  onUnlockHint={handleUnlockHint}
                />
              </div>
            )}

            {/* State C: Initial Empty State Placeholder (Default on page load) */}
            {!isAnalyzing && !hasSubmitted && (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 shadow-2xs text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <FileSearch className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Awaiting Proof Submission
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Submit your handwritten proof to see step-by-step reasoning diagnosis.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1.5 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <span>Automatic OCR extraction of geometric steps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span>Targeted detection of logical misconceptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>3-tiered scaffolded hint progression</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

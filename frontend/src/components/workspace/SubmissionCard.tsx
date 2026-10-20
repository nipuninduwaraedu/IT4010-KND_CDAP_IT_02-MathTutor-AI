"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  PlayCircle,
  Loader2,
} from "lucide-react";

interface SubmissionCardProps {
  onAnalyze: (submission: { type: "image" | "text"; content: string; file?: File }) => void;
  isAnalyzing: boolean;
  uploadedFile: File | null;
  imagePreviewUrl: string | null;
  onFileSelect: (file: File | null, previewUrl: string | null) => void;
  manualText: string;
  setManualText: (text: string) => void;
}

/**
 * Prominent Input Submission Component.
 * Features a clean drag-and-drop proof image upload zone and an optional collapsible text area.
 */
export const SubmissionCard: React.FC<SubmissionCardProps> = ({
  onAnalyze,
  isAnalyzing,
  uploadedFile,
  imagePreviewUrl,
  onFileSelect,
  manualText,
  setManualText,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isManualCollapsed, setIsManualCollapsed] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    setUploadError(null);
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload an authentic proof image (.png, .jpg, or .jpeg).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size exceeds 10MB limit. Please upload a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFileSelect(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper generator so evaluators can test instantly without a local camera photo
  const handleLoadSampleProofImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fcfbfa";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ruled lines
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      for (let y = 40; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Red margin
      ctx.strokeStyle = "#fca5a5";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(48, canvas.height);
      ctx.stroke();

      // Student proof text
      ctx.fillStyle = "#1e3a8a";
      ctx.font = "italic 16px 'Comic Sans MS', cursive, sans-serif";
      ctx.fillText("Student Proof: Theorem 25.3 (Circle Theorems)", 60, 32);
      ctx.font = "italic 15px 'Comic Sans MS', cursive, sans-serif";
      ctx.fillText("Step 1: In circle with center O, AB is chord, C on circumference.", 60, 72);
      ctx.fillText("Step 2: Chord AB subtends ∠ACB, so ∠ACB = 90° (Semicircle).", 60, 104);
      ctx.fillText("Step 3: ∴ ∠ACB = 90° [Proved]", 60, 136);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px monospace";
      ctx.fillText("Sri Lankan O/L Student Proof - Grade 11 Practice", 60, 200);

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File([blob], "student_proof_circle_theorem.png", {
            type: "image/png",
          });
          processFile(sampleFile);
        }
      });
    }
  };

  const handleTriggerAnalysis = () => {
    if (activeTab === "upload" && uploadedFile && imagePreviewUrl) {
      onAnalyze({
        type: "image",
        content: imagePreviewUrl,
        file: uploadedFile,
      });
    } else {
      onAnalyze({
        type: "text",
        content: manualText,
      });
    }
  };

  const hasSubmissionInput =
    activeTab === "upload" ? !!uploadedFile : manualText.trim().length > 10;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "upload"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Proof Image Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "text"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Manual Text (Viva Mode)
          </button>
        </div>

        {/* Subtle Sample Loader for quick testing */}
        {!uploadedFile && activeTab === "upload" && (
          <button
            type="button"
            onClick={handleLoadSampleProofImage}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Use Sample Proof Image
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Upload Mode */}
        {activeTab === "upload" && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
            />

            {!uploadedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? "border-indigo-500 bg-indigo-50/60 scale-[1.01]"
                    : "border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50"
                }`}
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Drop handwritten proof image (.png, .jpg) here or click to browse
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
                  Take a photo of your handwritten geometry solution sheet and upload it for automatic OCR parsing and misconception analysis.
                </p>
                <div className="mt-4 inline-flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>PNG, JPG, JPEG up to 10MB</span>
                </div>
              </div>
            ) : (
              /* Selected Image State with Thumbnail */
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 truncate max-w-xs">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(uploadedFile.size / 1024).toFixed(1)} KB • File attached
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isAnalyzing}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {imagePreviewUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 max-h-52 bg-slate-900/5 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreviewUrl}
                      alt="Student Proof Submission"
                      className="object-contain max-h-52 w-full"
                    />
                  </div>
                )}
              </div>
            )}

            {uploadError && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Manual Text Mode */}
        {activeTab === "text" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Optional: Type or paste proof lines</span>
              <button
                type="button"
                onClick={() => setIsManualCollapsed(!isManualCollapsed)}
                className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
              >
                {isManualCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                {isManualCollapsed ? "Expand" : "Collapse"}
              </button>
            </div>

            {!isManualCollapsed && (
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={`Step 1: In the circle with center O, AB is a chord and C is on the circumference. [Given]\nStep 2: Chord AB subtends angle ACB, so angle ACB = 90°. [Angle in a semicircle]\nStep 3: Therefore angle ACB = 90°. [Proved]`}
                rows={4}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white leading-relaxed resize-y"
              />
            )}
          </div>
        )}

        {/* Action Button: Analyze Proof */}
        <div>
          <button
            type="button"
            onClick={handleTriggerAnalysis}
            disabled={!hasSubmissionInput || isAnalyzing}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
              isAnalyzing
                ? "bg-indigo-500 text-white cursor-wait"
                : hasSubmissionInput
                ? "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-200 cursor-pointer hover:shadow-md"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Processing handwriting with OCR... Running misconception classifier...
              </>
            ) : (
              <>
                <PlayCircle className="w-4.5 h-4.5" />
                Analyze Proof
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionCard;

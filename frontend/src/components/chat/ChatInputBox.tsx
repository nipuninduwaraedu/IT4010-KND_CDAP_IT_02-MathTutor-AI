"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  ArrowUp,
  Image as ImageIcon,
  X,
  Sparkles,
  Paperclip,
  Loader2,
} from "lucide-react";

interface ChatInputBoxProps {
  onSendMessage: (payload: { text: string; imageFile: File | null; previewUrl: string | null }) => void;
  isLoading: boolean;
  isInitialCentered?: boolean;
}

export const ChatInputBox: React.FC<ChatInputBoxProps> = ({
  onSendMessage,
  isLoading,
  isInitialCentered = false,
}) => {
  const [text, setText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-resize textarea like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleProcessFile = (file: File) => {
    const valid = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!valid.includes(file.type)) return;

    setAttachedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith("image/")) {
        e.preventDefault();
        handleProcessFile(file);
      }
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if ((!text.trim() && !attachedFile) || isLoading) return;

    onSendMessage({
      text: text.trim(),
      imageFile: attachedFile,
      previewUrl: attachedPreview,
    });

    setText("");
    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper sample generator so anyone can test the image ingestion without real photo
  const handleLoadSampleProof = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fafaf9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      for (let y = 40; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "#fca5a5";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(48, canvas.height);
      ctx.stroke();

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
          handleProcessFile(sampleFile);
          if (!text) {
            setText("Verify my geometry proof steps for circle theorem 25.3 and check for misconceptions.");
          }
        }
      });
    }
  };

  const canSubmit = (text.trim().length > 0 || !!attachedFile) && !isLoading;

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* ChatGPT-style Dropzone Input Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
        className={`relative bg-[#f4f4f4] rounded-3xl p-3 border transition-all duration-200 ${
          isDragOver
            ? "border-slate-800 bg-slate-100 ring-2 ring-slate-800/20"
            : "border-transparent focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-md"
        }`}
      >
        {/* Drag Overlay Hint */}
        {isDragOver && (
          <div className="absolute inset-0 bg-white/95 rounded-3xl border-2 border-dashed border-slate-700 flex items-center justify-center gap-2 text-sm font-semibold text-slate-800 z-10 backdrop-blur-xs">
            <ImageIcon className="w-5 h-5 text-slate-700" />
            <span>Drop proof image here to attach</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0]);
            }
          }}
          accept=".png,.jpg,.jpeg,.webp"
          className="hidden"
        />

        {/* Image Attachment Chip Preview (Inside ChatGPT input box) */}
        {attachedPreview && (
          <div className="mb-2 pl-1 flex items-center gap-2">
            <div className="relative group inline-flex items-center gap-2 p-1.5 pr-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedPreview}
                alt="Proof thumbnail"
                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
              />
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-800 max-w-[160px] truncate">
                  {attachedFile?.name || "Proof Image"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {attachedFile ? (attachedFile.size / 1024).toFixed(1) + " KB" : "Ready"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-black transition-colors"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Main Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Ask anything, type proof steps, or drag & drop proof image here..."
          rows={1}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-500 focus:outline-none resize-none px-2 py-1 leading-relaxed max-h-44"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Action Buttons: Attach File + Sample Helper */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
              title="Attach handwritten proof (.png, .jpg)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLoadSampleProof}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs transition-colors"
              title="Quickly test with sample student proof"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Attach Sample Proof</span>
            </button>
          </div>

          {/* Right Action: Send Arrow Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSubmit}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              canSubmit
                ? "bg-slate-900 hover:bg-black text-white shadow-xs cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* ChatGPT Disclaimer Footer */}
      <p className="text-center text-[11px] text-slate-400 mt-2">
        MathSense AI for Sri Lanka O/L Grade 11 Mathematics • Member 1 (OCR) &amp; Member 2 (Reasoning Engine)
      </p>
    </div>
  );
};

export default ChatInputBox;

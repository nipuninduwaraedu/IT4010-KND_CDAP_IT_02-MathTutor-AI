"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Image as ImageIcon, X, Paperclip, Loader2, AlertCircle } from "lucide-react";

interface ChatInputBoxProps {
  onSendMessage: (payload: { imageFile: File; problemText?: string; previewUrl: string }) => void;
  isLoading: boolean;
}

/**
 * Clean ChatGPT-style Input Box.
 * Supports dragging and dropping handwritten proof images, uploading from device,
 * and entering optional geometry problem text.
 */
export const ChatInputBox: React.FC<ChatInputBoxProps> = ({
  onSendMessage,
  isLoading,
}) => {
  const [problemText, setProblemText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [problemText]);

  const handleProcessFile = (file: File) => {
    setValidationError(null);
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    const isImage = validTypes.includes(file.type) || /\.(png|jpg|jpeg)$/i.test(file.name);

    if (!isImage) {
      setValidationError("Please upload a handwritten proof image (.png or .jpg).");
      return;
    }

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
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if (isLoading) return;

    if (!attachedFile || !attachedPreview) {
      setValidationError("Please attach a handwritten proof image (.png or .jpg) to analyze.");
      return;
    }

    setValidationError(null);
    onSendMessage({
      imageFile: attachedFile,
      problemText: problemText.trim() || undefined,
      previewUrl: attachedPreview,
    });

    setProblemText("");
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

  const canSubmit = !!attachedFile && !isLoading;

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {validationError && (
        <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{validationError}</span>
        </div>
      )}

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
        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-white/95 rounded-3xl border-2 border-dashed border-slate-700 flex items-center justify-center gap-2 text-sm font-semibold text-slate-800 z-10 backdrop-blur-xs">
            <ImageIcon className="w-5 h-5 text-slate-700" />
            <span>Drop proof image here to attach (.png, .jpg)</span>
          </div>
        )}

        {/* Hidden File Input for Device Access */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0]);
            }
          }}
          accept=".png,.jpg,.jpeg"
          className="hidden"
        />

        {/* Attached Proof Image Badge */}
        {attachedFile && attachedPreview && (
          <div className="mb-2 pl-1 flex items-center gap-2">
            <div className="relative group inline-flex items-center gap-2 p-1.5 pr-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedPreview}
                alt="Proof preview"
                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
              />
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-800 max-w-[200px] truncate">
                  {attachedFile.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {(attachedFile.size / 1024).toFixed(1)} KB • Image attached
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-black transition-colors"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Optional Problem Context Prompt Textarea */}
        <textarea
          ref={textareaRef}
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            attachedFile
              ? "Add optional problem statement / question text (optional)..."
              : "Drag & drop proof image here or click 📎 to upload from device..."
          }
          rows={1}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-500 focus:outline-none resize-none px-2 py-1 leading-relaxed max-h-44"
        />

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Upload From Device Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer"
            title="Upload proof image from device (.png, .jpg)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Send / Analyze Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSubmit}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              canSubmit
                ? "bg-slate-900 hover:bg-black text-white shadow-xs cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            title="Analyze Proof"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400 mt-2">
        MathTutor AI
      </p>
    </div>
  );
};

export default ChatInputBox;

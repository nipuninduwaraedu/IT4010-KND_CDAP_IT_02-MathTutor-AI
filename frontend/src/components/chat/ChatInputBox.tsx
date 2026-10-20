"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, ArrowUp, Image as ImageIcon, X, Paperclip, Loader2 } from "lucide-react";

interface ChatInputBoxProps {
  onSendMessage: (payload: { text: string; imageFile: File | null; previewUrl: string | null }) => void;
  isLoading: boolean;
}

/**
 * Clean ChatGPT-style Input Box.
 * Supports drag-and-drop proof image upload, device file picker, clipboard image paste, and text typing.
 */
export const ChatInputBox: React.FC<ChatInputBoxProps> = ({
  onSendMessage,
  isLoading,
}) => {
  const [text, setText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleProcessFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type) && !file.type.startsWith("image/")) return;

    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedPreview(null);
    }
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

  const canSubmit = (text.trim().length > 0 || !!attachedFile) && !isLoading;

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
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
        {/* Full Dropzone Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-white/95 rounded-3xl border-2 border-dashed border-slate-700 flex items-center justify-center gap-2 text-sm font-semibold text-slate-800 z-10 backdrop-blur-xs">
            <ImageIcon className="w-5 h-5 text-slate-700" />
            <span>Drop your proof image here</span>
          </div>
        )}

        {/* Hidden File Input for Device Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0]);
            }
          }}
          accept="image/png,image/jpeg,image/jpg,image/webp,.pdf"
          className="hidden"
        />

        {/* Image Attachment Preview Badge */}
        {attachedFile && (
          <div className="mb-2 pl-1 flex items-center gap-2">
            <div className="relative group inline-flex items-center gap-2 p-1.5 pr-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              {attachedPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attachedPreview}
                  alt="Attachment preview"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <Paperclip className="w-5 h-5" />
                </div>
              )}
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-800 max-w-[180px] truncate">
                  {attachedFile.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {(attachedFile.size / 1024).toFixed(1)} KB • Attached from device
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

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Ask a question, type your proof, or drag & drop proof images here..."
          rows={1}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-500 focus:outline-none resize-none px-2 py-1 leading-relaxed max-h-44"
        />

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Device Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
            title="Upload proof image from device"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSubmit}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              canSubmit
                ? "bg-slate-900 hover:bg-black text-white shadow-xs cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            title="Send"
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
        MathSense AI • Intelligent Misconception Detection System for O/L Mathematics
      </p>
    </div>
  );
};

export default ChatInputBox;

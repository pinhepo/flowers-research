"use client";

import { useRef, useState, useCallback } from "react";

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string, preview: string) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(",")[1];
        const preview = result;
        onImageSelect(base64, file.type, preview);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3
        w-full min-h-40 rounded-2xl border-2 border-dashed
        transition-all duration-200 cursor-pointer select-none
        ${dragging
          ? "border-green-400 bg-green-950/40 scale-[1.01]"
          : "border-green-700/50 bg-green-950/20 hover:border-green-500 hover:bg-green-950/30"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <span className="text-4xl">🌿</span>
      <div className="text-center">
        <p className="text-green-300 font-medium">
          {dragging ? "Solte a imagem aqui" : "Arraste uma imagem ou clique para selecionar"}
        </p>
        <p className="text-green-600 text-sm mt-1">JPEG, PNG, WebP ou GIF</p>
      </div>
    </div>
  );
}

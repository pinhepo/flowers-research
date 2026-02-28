"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string, preview: string) => void;
  disabled?: boolean;
}

type Mode = "camera" | "upload";

export function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const [mode, setMode] = useState<Mode>("camera");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError("Câmera não disponível. Use a opção de upload.");
      setMode("upload");
    }
  }, []);

  // Inicia câmera ao entrar no modo camera
  useEffect(() => {
    if (mode === "camera" && !disabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, disabled, startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const base64 = dataUrl.split(",")[1];
    stopCamera();
    onImageSelect(base64, "image/jpeg", dataUrl);
  }, [onImageSelect, stopCamera]);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result.split(",")[1], file.type, result);
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

  return (
    <div className="space-y-3">
      {/* Toggle câmera / upload */}
      <div className="flex rounded-xl overflow-hidden border border-green-800/40 w-fit mx-auto">
        {(["camera", "upload"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => !disabled && setMode(m)}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-green-800/60 text-green-200"
                : "text-green-600 hover:text-green-400"
            }`}
          >
            {m === "camera" ? "📷 Câmera" : "🖼️ Upload"}
          </button>
        ))}
      </div>

      {/* Modo câmera */}
      {mode === "camera" && (
        <div className="relative w-full overflow-hidden rounded-2xl bg-black border border-green-900/40">
          {/* Video feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full max-h-[70vh] object-cover ${cameraActive ? "block" : "hidden"}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Loading da câmera */}
          {!cameraActive && !cameraError && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-green-500 text-sm">Acessando câmera...</p>
            </div>
          )}

          {/* Erro */}
          {cameraError && (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <span className="text-3xl">📵</span>
              <p className="text-red-400 text-sm text-center px-4">{cameraError}</p>
            </div>
          )}

          {/* Botão de captura */}
          {cameraActive && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={capturePhoto}
                disabled={disabled}
                className="w-16 h-16 rounded-full bg-white border-4 border-green-400 shadow-lg shadow-green-900/50
                           active:scale-95 transition-transform disabled:opacity-50"
                aria-label="Tirar foto"
              />
            </div>
          )}
        </div>
      )}

      {/* Modo upload */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-3
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
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            disabled={disabled}
          />
          <span className="text-4xl">🌿</span>
          <div className="text-center">
            <p className="text-green-300 font-medium">
              {dragging ? "Solte a imagem aqui" : "Arraste ou clique para selecionar"}
            </p>
            <p className="text-green-600 text-sm mt-1">JPEG, PNG, WebP ou GIF</p>
          </div>
        </div>
      )}
    </div>
  );
}

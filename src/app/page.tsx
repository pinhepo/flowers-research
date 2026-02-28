"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { PlantResult } from "@/components/PlantResult";
import type { Plant } from "@/types/plant";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "result"; plant: Plant; preview: string }
  | { status: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageSelect = async (
    base64: string,
    mimeType: string,
    imagePreview: string
  ) => {
    setPreview(imagePreview);
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({ status: "error", message: data.error ?? "Erro desconhecido." });
        return;
      }

      setState({ status: "result", plant: data.plant, preview: imagePreview });
    } catch {
      setState({
        status: "error",
        message: "Falha ao conectar com o servidor. Verifique sua conexão.",
      });
    }
  };

  const handleReset = () => {
    setState({ status: "idle" });
    setPreview(null);
  };

  const currentPreview =
    state.status === "result" ? state.preview : preview;

  return (
    <main className="min-h-screen bg-[#0a0f0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🌺</div>
          <h1 className="text-3xl font-bold text-white">Identificador de Plantas</h1>
          <p className="text-green-400/70 mt-2 text-sm">
            Envie uma foto de qualquer planta, flor ou árvore para identificá-la
            e saber sobre riscos e comestibilidade.
          </p>
        </div>

        {/* Upload */}
        {state.status !== "result" && (
          <ImageUploader
            onImageSelect={handleImageSelect}
            disabled={state.status === "loading"}
          />
        )}

        {/* Preview enquanto carrega */}
        {currentPreview && state.status === "loading" && (
          <div className="mt-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPreview}
                alt="Imagem selecionada"
                className="w-full max-h-72 object-contain bg-black/30"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-green-300 text-sm font-medium">
                  Analisando imagem com Claude...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Erro */}
        {state.status === "error" && (
          <div className="mt-6 bg-red-950/40 border border-red-700/50 rounded-2xl p-5 text-center">
            <span className="text-3xl">❌</span>
            <p className="text-red-300 mt-2 font-medium">{state.message}</p>
            <button
              onClick={handleReset}
              className="mt-4 text-sm text-white/60 underline hover:text-white transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Resultado */}
        {state.status === "result" && (
          <div className="space-y-6">
            {/* Imagem + botão de nova análise */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.preview}
                alt="Planta identificada"
                className="w-full max-h-72 object-contain bg-black/30"
              />
            </div>

            <PlantResult plant={state.plant} />

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-green-800/40 hover:bg-green-700/50 border border-green-700/50 text-green-300 font-medium transition-all duration-200 hover:scale-[1.01]"
            >
              Analisar outra planta
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

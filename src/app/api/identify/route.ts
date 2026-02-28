import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PlantSchema } from "@/types/plant";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    identified: { type: SchemaType.BOOLEAN },
    not_a_plant: { type: SchemaType.BOOLEAN },
    confidence: { type: SchemaType.STRING, enum: ["high", "medium", "low"] },
    name: {
      type: SchemaType.OBJECT,
      properties: {
        common: { type: SchemaType.STRING },
        scientific: { type: SchemaType.STRING },
        family: { type: SchemaType.STRING },
      },
      required: ["common", "scientific", "family"],
    },
    description: { type: SchemaType.STRING },
    toxicity: {
      type: SchemaType.OBJECT,
      properties: {
        is_toxic: { type: SchemaType.BOOLEAN },
        toxic_to: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        dangerous_parts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        symptoms: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        severity: {
          type: SchemaType.STRING,
          enum: ["none", "mild", "moderate", "severe", "fatal"],
        },
      },
      required: ["is_toxic", "toxic_to", "dangerous_parts", "symptoms", "severity"],
    },
    edibility: {
      type: SchemaType.OBJECT,
      properties: {
        is_edible: { type: SchemaType.BOOLEAN },
        edible_parts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        preparation: { type: SchemaType.STRING },
        warnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ["is_edible", "edible_parts", "preparation", "warnings"],
    },
  },
  required: [
    "identified",
    "not_a_plant",
    "confidence",
    "name",
    "description",
    "toxicity",
    "edibility",
  ],
};

const PROMPT = `Você é um especialista em botânica e biologia vegetal. Analise a imagem e identifique a planta, flor, árvore, arbusto, fungo ou qualquer vegetal presente.

Responda SEMPRE em português brasileiro.

Para "description": escreva 2-3 frases sobre a planta.
Para "toxic_to": quem pode ser afetado (ex: "humanos", "cães", "gatos").
Para "dangerous_parts": partes perigosas (ex: "folhas", "sementes", "todas as partes").
Para "symptoms": sintomas de envenenamento mais comuns.
Para "edible_parts": partes que podem ser consumidas.
Para "preparation": como preparar para consumo, ou string vazia se não comestível.

Se a imagem não contiver planta alguma: identified=false, not_a_plant=true, demais campos com valores padrão.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mimeType } = body as { image: string; mimeType: string };

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Imagem e tipo MIME são obrigatórios." },
        { status: 400 }
      );
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: "Tipo de imagem inválido. Use JPEG, PNG, GIF ou WebP." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as Schema,
      },
    });

    const result = await model.generateContent([
      { inlineData: { data: image, mimeType } },
      PROMPT,
    ]);

    const raw = result.response.text();
    const parsed = PlantSchema.parse(JSON.parse(raw));

    return NextResponse.json({ plant: parsed });
  } catch (error) {
    console.error("Erro ao identificar planta:", error);
    return NextResponse.json(
      { error: "Falha ao analisar a imagem. Tente novamente." },
      { status: 500 }
    );
  }
}

import type { Plant } from "@/types/plant";

const confidenceLabel: Record<Plant["confidence"], string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const confidenceColor: Record<Plant["confidence"], string> = {
  high: "text-green-400 bg-green-950/60 border-green-700",
  medium: "text-yellow-400 bg-yellow-950/60 border-yellow-700",
  low: "text-orange-400 bg-orange-950/60 border-orange-700",
};

const severityLabel: Record<Plant["toxicity"]["severity"], string> = {
  none: "Nenhuma",
  mild: "Leve",
  moderate: "Moderada",
  severe: "Severa",
  fatal: "Fatal",
};

const severityColor: Record<Plant["toxicity"]["severity"], string> = {
  none: "text-green-400 bg-green-950/60 border-green-700",
  mild: "text-yellow-400 bg-yellow-950/60 border-yellow-700",
  moderate: "text-orange-400 bg-orange-950/60 border-orange-700",
  severe: "text-red-400 bg-red-950/60 border-red-700",
  fatal: "text-red-300 bg-red-950 border-red-500",
};

interface PlantResultProps {
  plant: Plant;
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h3 className="text-base font-semibold text-white/80 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}
    >
      {text}
    </span>
  );
}

function TagList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (!items.length) {
    return <p className="text-white/40 text-sm italic">{emptyText}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full border border-white/10"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function PlantResult({ plant }: PlantResultProps) {
  if (plant.not_a_plant) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
        <span className="text-5xl">🔍</span>
        <p className="text-white/70 mt-3 font-medium">
          Nenhuma planta identificada na imagem.
        </p>
        <p className="text-white/40 text-sm mt-1">
          Envie uma foto de uma planta, flor, árvore ou fungo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho — nome e confiança */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-white">{plant.name.common}</h2>
            <p className="text-green-400/80 italic text-sm mt-0.5">
              {plant.name.scientific}
            </p>
            <p className="text-white/50 text-sm">{plant.name.family}</p>
          </div>
          <Badge
            text={`Confiança: ${confidenceLabel[plant.confidence]}`}
            className={confidenceColor[plant.confidence]}
          />
        </div>
        <p className="text-white/70 text-sm mt-3 leading-relaxed">{plant.description}</p>
      </div>

      {/* Toxicidade */}
      <Section title="Toxicidade" icon="⚠️">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              text={plant.toxicity.is_toxic ? "Tóxica" : "Não tóxica"}
              className={
                plant.toxicity.is_toxic
                  ? "text-red-400 bg-red-950/60 border-red-700"
                  : "text-green-400 bg-green-950/60 border-green-700"
              }
            />
            <Badge
              text={`Gravidade: ${severityLabel[plant.toxicity.severity]}`}
              className={severityColor[plant.toxicity.severity]}
            />
          </div>

          {plant.toxicity.is_toxic && (
            <>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wide mb-1.5">
                  Afeta
                </p>
                <TagList
                  items={plant.toxicity.toxic_to}
                  emptyText="Não informado"
                />
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wide mb-1.5">
                  Partes perigosas
                </p>
                <TagList
                  items={plant.toxicity.dangerous_parts}
                  emptyText="Não informado"
                />
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wide mb-1.5">
                  Sintomas
                </p>
                <TagList
                  items={plant.toxicity.symptoms}
                  emptyText="Nenhum sintoma listado"
                />
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Comestibilidade */}
      <Section title="Comestibilidade" icon="🍽️">
        <div className="space-y-3">
          <Badge
            text={plant.edibility.is_edible ? "Comestível" : "Não comestível"}
            className={
              plant.edibility.is_edible
                ? "text-green-400 bg-green-950/60 border-green-700"
                : "text-red-400 bg-red-950/60 border-red-700"
            }
          />

          {plant.edibility.is_edible && (
            <>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wide mb-1.5">
                  Partes comestíveis
                </p>
                <TagList
                  items={plant.edibility.edible_parts}
                  emptyText="Não informado"
                />
              </div>
              {plant.edibility.preparation && (
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wide mb-1.5">
                    Como preparar
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {plant.edibility.preparation}
                  </p>
                </div>
              )}
            </>
          )}

          {plant.edibility.warnings.length > 0 && (
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1.5">
                Avisos
              </p>
              <ul className="space-y-1">
                {plant.edibility.warnings.map((w) => (
                  <li key={w} className="text-yellow-400/80 text-sm flex gap-2">
                    <span>•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

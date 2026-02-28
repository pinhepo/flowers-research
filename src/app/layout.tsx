import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Identificador de Plantas",
  description:
    "Identifique plantas, flores e árvores com IA. Saiba sobre toxicidade e comestibilidade.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

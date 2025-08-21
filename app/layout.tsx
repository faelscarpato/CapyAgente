export const metadata = { title: "CapyAgente — MVP Autônomo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ background: "#0b0d10", color: "#e6edf3" }}>{children}</body>
    </html>
  );
}

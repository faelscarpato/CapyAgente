"use client";
import { useState } from "react";

export default function Home() {
  const [goal, setGoal] = useState("Gerar 6 slides sobre CapyUniverse");
  const [input, setInput] = useState("Tema Material You.");
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setOut(null);
    const r = await fetch("/api/agent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ goal, input })
    });
    const j = await r.json();
    setOut(j);
    setLoading(false);
  }

  return (
    <main className="min-h-dvh p-24">
      <h1 className="text-3xl font-bold">CapyAgente — teste</h1>

      <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Objetivo"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #333", background: "#11161c", color: "#e6edf3" }}
        />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Input opcional"
          rows={4}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #333", background: "#11161c", color: "#e6edf3" }}
        />
        <button
          onClick={run}
          disabled={loading}
          style={{ padding: "10px 16px", borderRadius: 8, background: "#22c55e", color: "#0b0d10", fontWeight: 700, width: "fit-content" }}>
          {loading ? "Rodando..." : "Executar agente"}
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 className="text-xl font-semibold">Saída</h2>
        <pre style={{ background: "rgba(0,0,0,.5)", padding: 12, borderRadius: 8, border: "1px solid #222", overflowX: "auto" }}>
          {out ? JSON.stringify(out, null, 2) : "—"}
        </pre>
      </div>
    </main>
  );
}

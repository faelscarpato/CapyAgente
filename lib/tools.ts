import { z } from "zod";
import pdf from "pdf-parse";
import { getGemini } from "./gemini";
import { createClient } from "@supabase/supabase-js";

/* ---------- util opcional ---------- */
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getToolsCatalog() {
  const url =
    process.env.TOOLS_JSON_URL ||
    "https://raw.githubusercontent.com/faelscarpato/capyuniverse/main/tools.json";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar tools.json: ${res.status}`);
  return res.json();
}

/* ---------- capyresumo ---------- */
export const summarizeSchema = z.object({
  text: z.string().min(10, "Forneça texto suficiente"),
  style: z.enum(["curto", "padrão", "didático"]).default("padrão")
});

async function capyresumo(input: z.infer<typeof summarizeSchema>) {
  const model = getGemini();
  const style =
    input.style === "curto" ? "em até 5 bullets" :
    input.style === "didático" ? "com exemplos claros" : "mantendo pontos-chave";
  const prompt = `Resuma o texto a seguir ${style}, em PT-BR e markdown:\n"""${input.text}"""`;
  const out = await model.generateContent(prompt);
  const text = out.response.text();

  const sb = getSupabase();
  if (sb) {
    await sb.from("agente_logs")
      .insert({ tool: "capyresumo", input_chars: input.text.length, output_chars: text.length })
      .catch(() => {});
  }
  return { tool: "capyresumo", ok: true as const, data: { summary: text } };
}

/* ---------- capyslide ---------- */
export const slidesSchema = z.object({
  topic: z.string().min(3),
  slideCount: z.number().min(3).max(20).default(8),
  theme: z.string().optional()
});

async function capyslide(input: z.infer<typeof slidesSchema>) {
  const model = getGemini();
  const prompt = `Gere um deck em JSON sobre "${input.topic}" com ${input.slideCount} slides.
Formato EXATO:
{
  "title": "Titulo geral",
  "slides": [
    { "title": "Slide 1", "bullets": ["...","..."], "speakerNotes": "..." }
  ]
}
Estilo: ${input.theme ?? "moderno minimalista"}. Proibido markdown dentro do JSON.`;
  const out = await model.generateContent(prompt);
  const raw = out.response.text().trim();

  let json: any;
  try { json = JSON.parse(raw); }
  catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return { tool: "capyslide", ok: false as const, error: "Falha ao parsear JSON" };
    json = JSON.parse(m[0]);
  }
  return { tool: "capyslide", ok: true as const, data: json };
}

/* ---------- capypdf ---------- */
export const pdfSchema = z.object({ url: z.string().url() });

async function capypdf(input: z.infer<typeof pdfSchema>) {
  const r = await fetch(input.url);
  if (!r.ok) return { tool: "capypdf", ok: false as const, error: `Download falhou: ${r.status}` };
  const buf = Buffer.from(await r.arrayBuffer());
  const parsed = await pdf(buf);
  const model = getGemini();
  const prompt = `Leia o conteúdo (de um PDF) e:
- Liste 5 insights críticos
- Proponha 3 ações práticas
- Responda em PT-BR com markdown

TEXTO:
"""${parsed.text.slice(0, 24000)}"""`;
  const out = await model.generateContent(prompt);
  return { tool: "capypdf", ok: true as const, data: { insights: out.response.text() } };
}

/* ---------- registry / dispatcher ---------- */
export type ToolCall = { name: string; input: any };

export async function getRegistry() {
  await getToolsCatalog().catch(() => null); // valida presença do catálogo
  return {
    capyresumo: { run: (i: any) => capyresumo(summarizeSchema.parse(i)) },
    capyslide:  { run: (i: any) => capyslide(slidesSchema.parse(i)) },
    capypdf:    { run: (i: any) => capypdf(pdfSchema.parse(i)) }
  };
}

export async function dispatchTool(call: ToolCall) {
  const reg = await getRegistry();
  const t = (reg as any)[call.name?.toLowerCase()];
  if (!t) return { tool: call.name, ok: false as const, error: `Ferramenta desconhecida: ${call.name}` };
  return t.run(call.input);
}

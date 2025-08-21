import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Sem GEMINI_API_KEY (veja .env.local)");
  const m = new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-1.5-flash" });
  const r = await m.generateContent("Responda com apenas uma palavra: ok");
  console.log("Gemini respondeu:", r.response.text());
}

main().catch((e) => {
  console.error("ERRO:", e?.message || e);
  process.exit(1);
});

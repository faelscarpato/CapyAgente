import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGemini(model = "gemini-1.5-flash") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY ausente no .env.local");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model,
    generationConfig: { temperature: 0.6 }
  });
}

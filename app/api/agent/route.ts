import { NextResponse } from "next/server";
import { runAgent } from "@/lib/graph";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { goal, input } = await req.json();
    if (!goal) {
      return NextResponse.json({ ok: false, error: "goal obrigatório" }, { status: 400 });
    }
    const state = await runAgent(goal, input);
    return NextResponse.json({ ok: true, state });
  } catch (e: any) {
    const msg = e?.message || "Erro desconhecido";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

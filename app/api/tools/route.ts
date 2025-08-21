import { NextResponse } from "next/server";
import { getRegistry } from "@/lib/tools";

export async function GET() {
  const reg = await getRegistry();
  return NextResponse.json({ exposedTools: Object.keys(reg) });
}

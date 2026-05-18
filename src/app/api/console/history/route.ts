import { NextResponse } from "next/server";
import { readChatHistory } from "@/lib/console/history";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const history = await readChatHistory();
  return NextResponse.json({ history });
}

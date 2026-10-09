import { NextResponse } from "next/server";
import { getProspect } from "@/lib/repositories/prospects";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const prospect = getProspect(params.slug);
  if (!prospect) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ prospect });
}

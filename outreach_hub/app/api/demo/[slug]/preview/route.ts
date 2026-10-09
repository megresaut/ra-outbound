import { getPreviewState, startPreview, stopPreview } from "@/lib/preview-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  return new Response(JSON.stringify(getPreviewState(params.slug)), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const state = await startPreview(params.slug);
    return new Response(JSON.stringify(state), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        status: "error",
        errorMessage: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  const stopped = stopPreview(params.slug);
  return new Response(JSON.stringify({ stopped }), {
    headers: { "Content-Type": "application/json" },
  });
}

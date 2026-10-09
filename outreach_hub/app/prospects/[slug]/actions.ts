"use server";

import { revalidatePath } from "next/cache";
import { transitionStage } from "@/lib/repositories/events";
import type { Stage } from "@/lib/prospects";

export async function transitionAction(
  slug: string,
  newStage: Stage,
  note?: string
) {
  const result = transitionStage(slug, newStage, note);
  if (!result.ok) {
    throw new Error(result.reason);
  }
  revalidatePath(`/prospects/${slug}`);
  revalidatePath("/");
  return result;
}

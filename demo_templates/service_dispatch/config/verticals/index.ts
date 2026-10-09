import type { VerticalPack, VerticalKey } from "./types";
import { hvacPack } from "./hvac";
import { plumbingPack } from "./plumbing";
import { electricalPack } from "./electrical";

export const verticalPacks: Record<VerticalKey, VerticalPack> = {
  hvac: hvacPack,
  plumbing: plumbingPack,
  electrical: electricalPack,
};

export type { VerticalPack, VerticalKey };

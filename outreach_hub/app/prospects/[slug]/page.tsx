import { notFound } from "next/navigation";
import { getProspect } from "@/lib/repositories/prospects";
import { ProspectView } from "./ProspectView";

export const dynamic = "force-dynamic";

export default function ProspectPage({ params }: { params: { slug: string } }) {
  const prospect = getProspect(params.slug);
  if (!prospect) notFound();
  return <ProspectView prospect={prospect} />;
}

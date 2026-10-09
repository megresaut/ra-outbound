import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/repositories/campaigns";
import { CampaignView } from "./CampaignView";

export const dynamic = "force-dynamic";

export default function CampaignPage({ params }: { params: { id: string } }) {
  const campaign = getCampaign(params.id);
  if (!campaign) return notFound();
  return <CampaignView campaignId={params.id} initialName={campaign.name} />;
}

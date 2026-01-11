import { UnifiedCampaignForm } from "@/components/wizard/UnifiedCampaignForm";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            {/* Header removed as per request */}
            <UnifiedCampaignForm />
        </main>
    );
}

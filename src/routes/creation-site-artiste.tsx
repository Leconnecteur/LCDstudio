import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";
import { getLanding, landingHead } from "@/lib/landings";

const landing = getLanding("/creation-site-artiste");

export const Route = createFileRoute("/creation-site-artiste")({
  head: () => landingHead(landing),
  component: () => <LandingPage landing={landing} />,
});

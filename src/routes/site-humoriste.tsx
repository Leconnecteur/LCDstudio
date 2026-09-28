import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";
import { getLanding, landingHead } from "@/lib/landings";

const landing = getLanding("/site-humoriste");

export const Route = createFileRoute("/site-humoriste")({
  head: () => landingHead(landing),
  component: () => <LandingPage landing={landing} />,
});

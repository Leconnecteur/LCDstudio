import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";
import { getLanding, landingHead } from "@/lib/landings";

const landing = getLanding("/site-sortie-film");

export const Route = createFileRoute("/site-sortie-film")({
  head: () => landingHead(landing),
  component: () => <LandingPage landing={landing} />,
});

import { CONTACT_EMAIL } from "@/lib/contact";

export const SITE_URL = "https://lcdstudio.fr";
export const SITE_NAME = "LCD Studio";
export const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/a127f640-9b65-495e-aec7-6829d181d0d8";

export const SAME_AS = [
  "https://www.instagram.com/lcd_studio_digital",
  "https://www.facebook.com/people/Le-Connecteur-Digital/61566337440874/",
];

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path === "/" ? "/" : path}`;
}

/** Balises meta + canonical communes à chaque page indexable. */
export function seo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}) {
  const url = absoluteUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: type },
      { property: "og:image", content: image },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** Entrée `scripts` du head TanStack, rendue en <script type="application/ld+json">. */
export function ldJson(data: Record<string, unknown>) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  alternateName: ["LCD", "Le Connecteur Digital"],
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  image: DEFAULT_OG_IMAGE,
  email: CONTACT_EMAIL,
  telephone: "+33613630984",
  founder: { "@type": "Person", name: "Gérémy" },
  address: { "@type": "PostalAddress", addressCountry: "FR" },
  areaServed: { "@type": "Country", name: "France" },
  description:
    "Studio digital spécialisé dans les sites de sortie de films, les sites officiels d'artistes et les expériences interactives.",
  knowsAbout: [
    "Création de site internet pour artiste",
    "Site de sortie de film",
    "Site officiel d'humoriste",
    "Expérience digitale interactive",
    "Marketing digital cinéma",
  ],
  sameAs: SAME_AS,
};

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

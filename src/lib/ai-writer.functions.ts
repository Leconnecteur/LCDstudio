import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Input = {
  title?: string;
  client?: string;
  year?: string;
  url?: string;
  notes?: string;
};

export const draftProjectCopy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => data as Input)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY manquante");

    const prompt = `Tu es directeur de la rédaction pour un studio créatif haut de gamme (LCD) — ton cinématique, éditorial, français impeccable, jamais commercial ni générique.

À partir des notes brutes ci-dessous, rédige :
- "subtitle" : un sous-titre court (max 60 caractères), une accroche éditoriale
- "description" : 1 à 2 phrases (max 220 caractères) qui résument le projet avec précision
- "story" : 2 à 3 phrases (max 400 caractères) — un case study percutant, à la première personne du studio ("nous"), qui raconte l'intention, la mécanique et l'impact

Notes brutes :
Titre : ${data.title ?? "(non fourni)"}
Client : ${data.client ?? "(non fourni)"}
Année : ${data.year ?? "(non fournie)"}
Lien : ${data.url ?? "(non fourni)"}
Notes libres : ${data.notes ?? "(aucune)"}

Réponds UNIQUEMENT avec un objet JSON valide : { "subtitle": "...", "description": "...", "story": "..." }`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI Gateway ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content) as {
        subtitle?: string;
        description?: string;
        story?: string;
      };
      return {
        subtitle: parsed.subtitle ?? "",
        description: parsed.description ?? "",
        story: parsed.story ?? "",
      };
    } catch {
      throw new Error("Réponse IA invalide");
    }
  });

type CaseInput = {
  title?: string;
  client?: string;
  tagline?: string;
  notes?: string;
};

export const draftCaseStudy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => data as CaseInput)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY manquante");

    const prompt = `Tu es directeur éditorial pour le studio créatif LCD — ton cinématique, éditorial, français impeccable, jamais commercial. Tu rédiges une étude de cas long format en 4 blocs numérotés.

À partir des notes brutes ci-dessous, rédige un JSON avec :
- "tagline" : la punchline entre guillemets français « … », une question ou une phrase choc qui capture l'idée en une ligne. Max 140 caractères.
- "context" : "01. Le contexte" — 2 à 3 phrases qui plantent le décor : qui, quand, pour quel événement. Max 400 caractères.
- "challenge" : "02. Le défi" — 2 à 3 phrases sur la difficulté / le piège à éviter / ce qu'on voulait absolument NE PAS faire. Max 400 caractères.
- "idea" : "03. L'idée" — 3 à 4 phrases qui décrivent le concept créatif de manière évocatrice, presque comme un pitch de film. Max 500 caractères.
- "execution" : "04. L'exécution" — un tableau JSON de 3 à 5 chaînes courtes (bullet points), chacune ≤ 160 caractères, factuelle et précise.

Notes brutes :
Titre : ${data.title ?? "(non fourni)"}
Client : ${data.client ?? "(non fourni)"}
Punchline suggérée : ${data.tagline ?? "(aucune)"}
Notes libres : ${data.notes ?? "(aucune)"}

Réponds UNIQUEMENT avec un objet JSON valide :
{ "tagline": "...", "context": "...", "challenge": "...", "idea": "...", "execution": ["...", "..."] }`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI Gateway ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content) as {
        tagline?: string;
        context?: string;
        challenge?: string;
        idea?: string;
        execution?: unknown;
      };
      const exec = Array.isArray(parsed.execution)
        ? parsed.execution.filter((x) => typeof x === "string") as string[]
        : [];
      return {
        tagline: parsed.tagline ?? "",
        context: parsed.context ?? "",
        challenge: parsed.challenge ?? "",
        idea: parsed.idea ?? "",
        execution: exec,
      };
    } catch {
      throw new Error("Réponse IA invalide");
    }
  });
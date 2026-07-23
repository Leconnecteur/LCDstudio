# Plan — Studio LCD, page d'accueil cinématographique

Objectif : une home page unique, noire, monumentale, qui se lit comme le site d'un studio créatif haut de gamme (pas d'agence web). Toutes les sections que tu as listées, dans l'ordre, avec animations fluides et un mobile pensé séparément.

## Direction artistique (verrouillée)

- Fond `#050505`, texte off-white `#EDEAE4`, un seul accent rouge sang très parcimonieux pour puces / soulignés (jamais de gradients, jamais d'ombres décoratives).
- Typo display : **PP Neue Montreal** (ou General Sans en repli via Fontshare) — tailles héroïques (clamp jusqu'à ~14vw), tracking serré, quelques mots en italique éditorial pour la respiration ("qui comptent.").
- Grille très aérée, alignements francs, filets 1px, numérotation `01 — 06` façon générique de film.
- Curseur personnalisé discret (petit disque qui grossit sur les zones interactives, label textuel au hover des projets type "voir").
- Loader d'ouverture : masque noir plein écran, logo LCD qui se dessine, reveal du hero par mask vertical.

## Stack

Le template tourne sur **TanStack Start + React 19 + Tailwind v4** (pas Next.js — je garde la stack du projet, c'est ce qui est supporté ici). J'ajoute :

- `motion` (Framer Motion) pour reveals, mask, hover
- `gsap` + `ScrollTrigger` pour la timeline "Notre approche" et les pin/parallax
- `lenis` pour le smooth scroll
- pas de R3F au premier jet (aucune section ne le justifie ; on garde ça pour une v2 si un concept 3D émerge)

Chargement fonts via `<link>` dans `src/routes/__root.tsx` (Fontshare pour Neue Montreal + General Sans). Tokens couleurs/typo dans `src/styles.css` via `@theme`.

## Structure de la home (`src/routes/index.tsx` réécrit)

```text
<Loader />                       (une seule fois par session)
<CustomCursor />
<Nav>                            LCD · menu plein écran mobile
<Hero>                           vidéo/plan cinématographique + titre monumental
<FeaturedExperiences>            "affiches" façon Netflix, hover vidéo
<WhatWeCreate>                   6 univers, ligne par ligne, image reveal au hover
<Approche>                       timeline verticale 01→06, pin GSAP
<ConceptLab>                     laboratoire d'idées, cartes larges, marquee
<Trust>                          logos discrets, marquee lent
<PullQuote>                      citation monumentale centrée
<CTA>                            image immense + "Imaginer ensemble"
<Footer>                         logo, nav, Instagram / LinkedIn / Mail
```

Chaque section vit dans `src/components/home/<Section>.tsx` pour rester lisible.

## Détails par section

**Hero** — plein écran, image cinéma (générée). Titre en 4 lignes avec mask reveal ligne par ligne, italique sur "qui comptent." Sous-titre "Films. Artistes. Sportifs. Événements." séparés par des filets. Deux CTA texte (souligné animé, pas de bouton lourd) : *Découvrir nos projets* / *Voir la showreel*. Indicateur scroll : filet vertical animé + "SCROLL".

**Featured Experiences** — 4 projets (Permis de Détruire, Kev Adams, Raw Talent, Padel Fight Club) présentés comme des affiches verticales. Hover : image → poster vidéo (mp4 court en placeholder, image animée si absent), titre qui monte, description qui apparaît, CTA "voir le projet".

**What We Create** — 6 lignes (Film / Artist / Athlete / Event / TV / Interactive). Chaque ligne = numéro + label typo XXL ; au hover, image cinématographique de la catégorie fade-in à droite (pattern awwwards classique, très efficace).

**Notre approche** — timeline verticale 01→06 (Découvrir, Imaginer, Concevoir, Développer, Lancer, Faire évoluer). Trait vertical qui se remplit au scroll (GSAP ScrollTrigger), chaque étape en fade-up séquencé.

**Concept Lab** — 4 concepts (Mission Impossible, Festival de Cannes, Roland Garros, Tour de France) en cartes larges type "fiche R&D" avec tag "NOUVEAU CONCEPT", visuel dédié, pitch court, CTA découvrir. Titre de section en marquee horizontal lent en fond.

**Trust** — marquee horizontal ultra lent, logos en type only (Kev Adams, Apollo Films, Raw Talent, Padel Fight Club, UGC, TF1, Canal+), opacité basse, hover → opacité pleine.

**Pull quote** — plein écran, "Nous ne créons pas des sites. Nous créons des expériences dont on se souvient." — mask reveal mot par mot au scroll.

**CTA final** — image immense (chaise de réalisateur / plateau), overlay "Parlons de votre prochain lancement." + CTA "Imaginer ensemble →".

**Footer** — logo LCD, mini nav, Instagram / LinkedIn / Mail, copyright discret.

## Animations (règles)

- Reveal texte : mask vertical par ligne, `cubic-bezier(.2,.8,.2,1)`, durée 900ms, stagger 60ms.
- Images : `clip-path` inset animé + léger scale from 1.08 → 1 (aucun bounce).
- Scroll : Lenis (lerp 0.1), ScrollTrigger pour la timeline et le pin du Concept Lab.
- Curseur : ressort doux, jamais >20px de diamètre au repos.
- Aucun parallax > 10% de déplacement.
- Reduced motion respecté : tout se dégrade en fondu simple.

## Responsive (mobile pensé séparément)

- Nav plein écran (overlay noir, liens XXL, sortie en mask).
- Hero : titre reformaté pour tenir en 4 lignes serrées, CTA empilés, filet scroll conservé.
- Featured Experiences : slider snap horizontal une carte à la fois.
- What We Create : liste verticale avec image miniature à droite de chaque label (pas de hover, révélé au scroll into view).
- Timeline : rail à gauche, contenu à droite, sans pin.
- Concept Lab : slider snap.
- Trust marquee : conservé, plus lent.

## Images

Toutes générées en amont via `imagegen` (style cinématographique, grain, clair-obscur, jamais corporate) et importées depuis `src/assets/` :

- Hero : silhouette d'homme rétro-éclairée, fumée, plateau de tournage.
- Permis de Détruire : silhouette + skyline en feu.
- Kev Adams : portrait dramatique noir & blanc.
- Raw Talent : basketteur en contre-jour dans un gymnase.
- Padel Fight Club : joueur dans une salle contrastée.
- 6 vignettes "What We Create" (film / artiste / athlète / événement / TV / campagne).
- 4 vignettes Concept Lab.
- CTA final : chaise de réalisateur sur plateau vide.

## SEO / head

Dans `src/routes/index.tsx` `head()` : title "LCD — Digital Experiences Studio", description dédiée, `og:title` / `og:description` / `og:type=website`. Root `__root.tsx` mis à jour pour ne plus servir les valeurs "Lovable App" par défaut.

## Détails techniques

- Ajout deps : `bun add motion gsap lenis`.
- Lenis initialisé dans un composant client-only monté depuis `__root.tsx` via `<ClientOnly>` (pas de smooth scroll en SSR).
- GSAP importé dynamiquement dans les composants qui l'utilisent (évite tout accès `window` au module scope).
- Curseur & loader : `useHydrated()` gate pour éviter tout mismatch SSR.
- Toutes les couleurs passent par les tokens dans `styles.css` (`--background`, `--foreground`, `--accent` = rouge sang). Aucune classe `bg-black` / `text-white` en dur.
- `src/routes/index.tsx` (placeholder actuel) entièrement remplacé — c'est la home demandée.

## Livrable de ce tour

Uniquement la home page complète + les composants qu'elle consomme + assets générés + tokens + fonts. Les pages `/projets`, `/concepts`, `/studio`, `/contact` ne sont pas construites ici (le brief demande la home) — je peux les enchaîner ensuite si tu veux.

---

Confirme et je construis. Si tu veux d'abord voir 2–3 directions rendues côte à côte avant que je m'engage sur la composition, dis-le et je passe par une étape de prototypes visuels.

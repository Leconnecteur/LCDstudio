import type { ProjectType } from "@/lib/contact";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  ldJson,
  ORGANIZATION_ID,
  organizationJsonLd,
  seo,
} from "@/lib/seo";

export type Landing = {
  path: string;
  navLabel: string;
  briefType: ProjectType;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: [string, string];
  intro: string;
  why: { title: string; paragraphs: string[] };
  deliverables: { title: string; desc: string }[];
  delay: string;
  reference: { client: string; label: string; desc: string; url?: string; image: "kev" | "permis" };
  steps: { title: string; desc: string }[];
  faq: { q: string; a: string }[];
  ctaTitle: string;
};

const STEPS_BASE = [
  {
    title: "Échange & brief",
    desc: "Un appel de 30 minutes pour comprendre votre univers, votre public et votre calendrier. Vous recevez une première idée sous 48 h.",
  },
  {
    title: "Concept & direction artistique",
    desc: "On imagine la mécanique et l'identité visuelle du site, puis on vous présente des maquettes avant de coder quoi que ce soit.",
  },
  {
    title: "Conception & développement",
    desc: "Développement sur mesure, rapide et pensé mobile d'abord. Vous suivez l'avancement sur un lien de prévisualisation.",
  },
  {
    title: "Mise en ligne & suivi",
    desc: "Lancement calé sur votre date, référencement de base, et ajustements après la mise en ligne.",
  },
];

export const LANDINGS: Landing[] = [
  {
    path: "/creation-site-artiste",
    navLabel: "Site d'artiste",
    briefType: "artiste",
    metaTitle: "Création de site internet pour artiste | LCD Studio",
    metaDescription:
      "Création de sites officiels pour artistes, musiciens, chanteurs et rappeurs : identité forte, tournée, billetterie, sortie d'album. Référence : Kev Adams. Devis sous 48 h.",
    eyebrow: "Création de site internet pour artiste",
    h1: ["Un site officiel", "à la hauteur de votre scène."],
    intro:
      "Musicien, chanteur, rappeur, DJ ou comédien : votre site officiel est le seul endroit que vous contrôlez vraiment. On le conçoit comme une extension de votre univers — pas comme un modèle générique — pour rassembler votre public, annoncer vos sorties et vendre vos dates.",
    why: {
      title: "Pourquoi un vrai site quand on a déjà Instagram ?",
      paragraphs: [
        "Les réseaux sociaux changent leurs règles tous les six mois et vous ne possédez ni votre audience ni votre visibilité. Un site officiel, lui, vous appartient : c'est la page que Google affiche quand on tape votre nom, celle que consultent les programmateurs, les journalistes et les marques avant de vous contacter.",
        "C'est aussi l'endroit où vous centralisez tout ce qui compte — clips, tournée, billetterie, boutique, contact booking — avec une image cohérente avec votre direction artistique.",
      ],
    },
    deliverables: [
      {
        title: "Direction artistique sur mesure",
        desc: "Un design pensé à partir de votre univers visuel, de vos pochettes et de vos clips. Aucun template.",
      },
      {
        title: "Tournée & billetterie",
        desc: "Vos dates toujours à jour, avec liens directs vers les billetteries (Ticketmaster, Fnac, Shotgun, See Tickets…).",
      },
      {
        title: "Sortie d'album ou de single",
        desc: "Page événement dédiée : pré-sauvegarde, compte à rebours, contenus exclusifs pour créer l'attente.",
      },
      {
        title: "Espace presse & booking",
        desc: "Biographie, photos HD, fiche technique et formulaire booking pour les pros.",
      },
      {
        title: "Autonomie totale",
        desc: "Vous ou votre manager mettez à jour dates, actus et vidéos sans passer par nous.",
      },
      {
        title: "Rapide, mobile, bien référencé",
        desc: "La grande majorité de vos fans viendront du mobile : le site est pensé pour eux, et optimisé pour ressortir sur votre nom dans Google.",
      },
    ],
    delay: "Site livré en 3 à 4 semaines",
    reference: {
      client: "Kev Adams",
      label: "Site officiel",
      desc: "Le site officiel de l'humoriste et acteur Kev Adams : une écriture digitale à la hauteur de sa présence scénique, qui centralise spectacles, films et actualités.",
      url: "https://kevadams.fr/",
      image: "kev",
    },
    steps: STEPS_BASE,
    faq: [
      {
        q: "Combien coûte un site internet pour un artiste ?",
        a: "Chaque site est conçu sur mesure, le budget dépend donc du périmètre : nombre de pages, boutique, page de sortie d'album, animations. Indiquez une fourchette dans le formulaire et on vous propose une solution adaptée sous 48 h, sans engagement.",
      },
      {
        q: "Combien de temps faut-il pour créer mon site ?",
        a: "Comptez en général 3 à 4 semaines entre le premier échange et la mise en ligne. Si vous avez une date de sortie ou de tournée, on cale le planning dessus.",
      },
      {
        q: "Est-ce que je pourrai mettre à jour mes dates de concert moi-même ?",
        a: "Oui. Vous disposez d'un espace d'administration simple pour modifier vos dates, actualités et vidéos sans compétence technique.",
      },
      {
        q: "Vous travaillez avec des artistes indépendants ou seulement des têtes d'affiche ?",
        a: "Les deux. On accompagne aussi bien des artistes en développement que des artistes installés, avec leur manager ou leur label.",
      },
      {
        q: "Pouvez-vous créer une page spéciale pour la sortie de mon album ?",
        a: "Oui, c'est même une de nos spécialités : page événement avec compte à rebours, pré-sauvegarde sur les plateformes, contenus exclusifs ou mécanique interactive pour faire parler de la sortie.",
      },
    ],
    ctaTitle: "Parlons de votre site officiel.",
  },
  {
    path: "/site-sortie-film",
    navLabel: "Site de film",
    briefType: "film",
    metaTitle: "Site internet de sortie de film sur mesure | LCD Studio",
    metaDescription:
      "Création de sites de sortie de films pour distributeurs et productions : site promotionnel, mécanique virale, réservation des séances. Référence : Apollo Films. Livré avant votre sortie.",
    eyebrow: "Site de sortie de film",
    h1: ["Le site qui remplit", "les salles de votre film."],
    intro:
      "Pour une sortie en salle, chaque semaine compte. On conçoit des sites promotionnels pensés comme de véritables campagnes : une idée forte tirée de l'univers du film, une expérience qui se partage, et un chemin direct vers la réservation des séances.",
    why: {
      title: "Au-delà de la page bande-annonce",
      paragraphs: [
        "Une simple page avec l'affiche et la bande-annonce ne suffit plus à créer l'événement. Les sorties qui marquent sont celles qui proposent une expérience : un jeu, une énigme, un faux site tiré de l'univers du film, un QR code à scanner en salle.",
        "Pour La Maison de nos rêves (Apollo Films), on a imaginé une fausse agence immobilière dont les « biens » étaient en réalité les séances de cinéma. Le site devient un objet de promotion à part entière, dont on parle et qu'on partage.",
      ],
    },
    deliverables: [
      {
        title: "Concept créatif tiré du film",
        desc: "Une idée originale qui prolonge l'univers du film et donne envie de le voir.",
      },
      {
        title: "Mécanique virale",
        desc: "Jeu, énigme, quiz, code à débloquer ou QR code en salle pour faire circuler le site.",
      },
      {
        title: "Réservation des séances",
        desc: "Accès direct aux séances et aux cinémas, en un clic depuis le mobile.",
      },
      {
        title: "Bande-annonce, casting, presse",
        desc: "Tout le matériel promo au même endroit, y compris un espace presse pour les journalistes.",
      },
      {
        title: "Prêt pour les réseaux sociaux",
        desc: "Pensé mobile d'abord, avec des visuels de partage soignés pour vos campagnes Instagram et TikTok.",
      },
      {
        title: "Planning calé sur la sortie",
        desc: "Mise en ligne avant l'avant-première, puis évolutions pendant l'exploitation en salle.",
      },
    ],
    delay: "Livré en 3 à 5 semaines avant la sortie",
    reference: {
      client: "Apollo Films",
      label: "Le Permis, La Maison de nos rêves",
      desc: "Des sites de sortie conçus comme des campagnes : identité complète, mécanique originale et parcours de réservation en un clic.",
      image: "permis",
    },
    steps: STEPS_BASE,
    faq: [
      {
        q: "Combien de temps avant la sortie faut-il lancer le projet ?",
        a: "Idéalement 6 à 8 semaines avant la sortie en salle. Le site est livré en 3 à 5 semaines, ce qui laisse le temps de le mettre en ligne avant l'avant-première et le début de la campagne.",
      },
      {
        q: "Vous travaillez avec les distributeurs ou les productions ?",
        a: "Avec les deux, ainsi qu'avec les agences de promotion et les attachés de presse. On s'intègre au plan marketing déjà en place.",
      },
      {
        q: "Quel budget prévoir pour un site de film ?",
        a: "Cela dépend de la mécanique imaginée (simple site promotionnel, jeu, expérience interactive). Indiquez une fourchette dans le formulaire : on vous propose un concept adapté à votre budget sous 48 h.",
      },
      {
        q: "Pouvez-vous intégrer la réservation des séances ?",
        a: "Oui, le site renvoie directement vers les séances et les cinémas pour transformer l'envie en réservation.",
      },
      {
        q: "Le site peut-il évoluer après la sortie ?",
        a: "Oui : on peut l'adapter pour l'exploitation en salle, la sortie VOD ou DVD, ou le réutiliser pour une suite.",
      },
    ],
    ctaTitle: "Votre film sort bientôt ? Parlons-en.",
  },
  {
    path: "/site-humoriste",
    navLabel: "Site d'humoriste",
    briefType: "artiste",
    metaTitle: "Création de site internet pour humoriste | LCD Studio",
    metaDescription:
      "Création de sites officiels pour humoristes et artistes de spectacle : dates de tournée, billetterie, vidéos, presse. Référence : le site officiel de Kev Adams. Devis sous 48 h.",
    eyebrow: "Site internet pour humoriste",
    h1: ["Votre spectacle mérite", "mieux qu'un lien en bio."],
    intro:
      "Quand un spectateur, un programmateur ou un journaliste tape votre nom, il doit tomber sur un site qui vous ressemble : votre ton, vos vidéos, vos dates et un bouton pour réserver. On a conçu le site officiel de Kev Adams — on peut faire le vôtre.",
    why: {
      title: "Un site pensé pour vendre des places",
      paragraphs: [
        "La billetterie d'un spectacle d'humour se joue souvent en quelques secondes : quelqu'un voit un extrait, tape votre nom, et doit trouver immédiatement la prochaine date près de chez lui. Chaque clic en trop, c'est une place en moins.",
        "Votre site officiel centralise vos dates de tournée, vos meilleurs extraits et vos liens de réservation, avec une identité qui colle à votre humour.",
      ],
    },
    deliverables: [
      {
        title: "Identité qui vous ressemble",
        desc: "Un design qui colle à votre personnage et à l'affiche de votre spectacle.",
      },
      {
        title: "Tournée & réservation",
        desc: "Toutes vos dates, triées par ville, avec réservation en un clic.",
      },
      {
        title: "Vidéos & extraits",
        desc: "Vos meilleurs passages YouTube, Instagram et TikTok mis en valeur.",
      },
      {
        title: "Espace pros",
        desc: "Dossier de presse, fiche technique et contact pour programmateurs et médias.",
      },
      {
        title: "Mise à jour autonome",
        desc: "Vous ou votre production ajoutez les nouvelles dates en deux minutes.",
      },
      {
        title: "Référencement sur votre nom",
        desc: "Structuré pour ressortir en premier dans Google quand on cherche votre nom ou votre spectacle.",
      },
    ],
    delay: "Site livré en 3 à 4 semaines",
    reference: {
      client: "Kev Adams",
      label: "Site officiel",
      desc: "Le site officiel de Kev Adams, humoriste et acteur : spectacles, films et actualités réunis dans une expérience à la hauteur de sa présence scénique.",
      url: "https://kevadams.fr/",
      image: "kev",
    },
    steps: STEPS_BASE,
    faq: [
      {
        q: "Combien coûte un site pour un humoriste ?",
        a: "Le budget dépend du nombre de pages et des fonctionnalités (tournée, boutique, espace presse). Indiquez une fourchette dans le formulaire : on vous répond sous 48 h avec une proposition adaptée.",
      },
      {
        q: "Je débute, est-ce que ça vaut le coup ?",
        a: "Oui : un site professionnel rassure les programmateurs et les salles, et vous permet d'être trouvé sur Google dès que votre nom commence à circuler.",
      },
      {
        q: "Est-ce que je peux ajouter mes dates moi-même ?",
        a: "Oui, vous avez un espace d'administration simple pour ajouter vos dates et vos liens de réservation.",
      },
      {
        q: "Vous pouvez reprendre mon site existant ?",
        a: "Oui, on peut refondre un site existant en conservant votre nom de domaine et votre référencement.",
      },
    ],
    ctaTitle: "Parlons de votre site officiel.",
  },
];

export function getLanding(path: string) {
  const landing = LANDINGS.find((l) => l.path === path);
  if (!landing) throw new Error(`Landing inconnue : ${path}`);
  return landing;
}

export function landingHead(l: Landing) {
  const { meta, links } = seo({ title: l.metaTitle, description: l.metaDescription, path: l.path });
  return {
    meta,
    links,
    scripts: [
      ldJson(organizationJsonLd),
      ldJson({
        "@context": "https://schema.org",
        "@type": "Service",
        name: l.eyebrow,
        serviceType: l.eyebrow,
        description: l.metaDescription,
        url: absoluteUrl(l.path),
        provider: { "@id": ORGANIZATION_ID },
        areaServed: { "@type": "Country", name: "France" },
        inLanguage: "fr-FR",
      }),
      ldJson(faqJsonLd(l.faq)),
      ldJson(
        breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: l.navLabel, path: l.path },
        ]),
      ),
    ],
  };
}

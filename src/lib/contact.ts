export const CONTACT_EMAIL = "hello@lcdstudio.fr";
export const CONTACT_PHONE_LABEL = "06 13 63 09 84";
export const CONTACT_PHONE_TEL = "tel:+33613630984";

export type ProjectType = "film" | "artiste" | "autre";

export const BRIEF_TYPE_EVENT = "lcd:brief-type";

export function selectBriefType(type: ProjectType) {
  window.dispatchEvent(new CustomEvent<ProjectType>(BRIEF_TYPE_EVENT, { detail: type }));
}

export function whatsappUrl(text = "Bonjour LCD, j'ai un projet à vous présenter.") {
  return `https://wa.me/33613630984?text=${encodeURIComponent(text)}`;
}

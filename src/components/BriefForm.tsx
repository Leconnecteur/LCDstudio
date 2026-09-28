import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BRIEF_TYPE_EVENT, CONTACT_EMAIL, whatsappUrl, type ProjectType } from "@/lib/contact";

const TYPES: { value: ProjectType; label: string }[] = [
  { value: "film", label: "Sortie de film" },
  { value: "artiste", label: "Artiste" },
  { value: "autre", label: "Autre projet" },
];

const BUDGETS = [
  "Moins de 5 000 €",
  "5 000 – 15 000 €",
  "15 000 – 30 000 €",
  "Plus de 30 000 €",
  "À définir ensemble",
];

const fieldCls =
  "w-full border-b border-[var(--lcd-fg)]/25 bg-transparent py-3 text-base text-[var(--lcd-fg)] outline-none transition-colors placeholder:text-[var(--lcd-dim)] focus:border-[var(--lcd-fg)]";
const labelCls = "text-hairline text-[var(--lcd-dim)]";

export function BriefForm({
  defaultType = "film",
  source = "home",
}: {
  defaultType?: ProjectType;
  source?: string;
}) {
  const [type, setType] = useState<ProjectType>(defaultType);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [fallbackHref, setFallbackHref] = useState("");

  useEffect(() => {
    const onType = (e: Event) => setType((e as CustomEvent<ProjectType>).detail);
    window.addEventListener(BRIEF_TYPE_EVENT, onType);
    return () => window.removeEventListener(BRIEF_TYPE_EVENT, onType);
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return; // honeypot anti-spam
    const get = (k: string) => {
      const v = String(fd.get(k) ?? "").trim();
      return v.length ? v : null;
    };
    const lead = {
      name: get("name") ?? "",
      email: get("email") ?? "",
      phone: get("phone"),
      company: get("company"),
      project_type: type,
      release_date: get("release_date"),
      budget: get("budget"),
      message: get("message"),
      source,
    };
    setStatus("sending");
    const { error } = await (supabase as any).from("leads").insert(lead);
    if (!error) {
      setStatus("sent");
      return;
    }
    console.error(error);
    const body = [
      `Nom : ${lead.name}`,
      `E-mail : ${lead.email}`,
      lead.phone && `Téléphone : ${lead.phone}`,
      lead.company && `Film / artiste / société : ${lead.company}`,
      `Type : ${TYPES.find((t) => t.value === type)?.label}`,
      lead.release_date && `Date de sortie : ${lead.release_date}`,
      lead.budget && `Budget : ${lead.budget}`,
      "",
      lead.message ?? "",
    ]
      .filter((l) => l !== null && l !== undefined)
      .join("\n");
    setFallbackHref(
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Nouveau projet — ${lead.company ?? lead.name}`)}&body=${encodeURIComponent(body)}`,
    );
    setStatus("error");
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-6 border border-[var(--lcd-fg)]/20 bg-[var(--lcd-bg)]/70 p-8 backdrop-blur md:p-10">
        <span className="text-hairline text-[var(--lcd-dim)]">
          <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[var(--lcd-accent)] align-middle" />
          Brief reçu
        </span>
        <p className="font-[var(--font-serif)] text-3xl italic leading-tight md:text-4xl">
          Merci. Je reviens vers vous sous 48&nbsp;h avec une première idée.
        </p>
        <a
          href={whatsappUrl("Bonjour Gérémy, je viens de vous envoyer un brief depuis le site.")}
          target="_blank"
          rel="noreferrer"
          className="text-hairline text-[var(--lcd-fg)] underline underline-offset-4"
        >
          C'est urgent ? Écrivez-moi sur WhatsApp →
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-7 border border-[var(--lcd-fg)]/20 bg-[var(--lcd-bg)]/70 p-6 backdrop-blur md:p-10"
    >
      <fieldset className="flex flex-col gap-3">
        <legend className={`${labelCls} mb-3`}>Votre projet</legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              aria-pressed={type === t.value}
              className={`rounded-full border px-4 py-2 text-hairline transition-colors ${
                type === t.value
                  ? "border-[var(--lcd-fg)] bg-[var(--lcd-fg)] text-[var(--lcd-bg)]"
                  : "border-[var(--lcd-fg)]/25 text-[var(--lcd-fg)]/80 hover:border-[var(--lcd-fg)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Nom *</span>
          <input name="name" required maxLength={200} autoComplete="name" className={fieldCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>E-mail *</span>
          <input
            name="email"
            type="email"
            required
            maxLength={320}
            autoComplete="email"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>
            {type === "film"
              ? "Titre du film / distributeur"
              : type === "artiste"
                ? "Nom d'artiste / label"
                : "Société / projet"}
          </span>
          <input name="company" maxLength={200} className={fieldCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Téléphone</span>
          <input name="phone" type="tel" maxLength={50} autoComplete="tel" className={fieldCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>
            {type === "film"
              ? "Date de sortie en salle"
              : type === "artiste"
                ? "Sortie / tournée prévue"
                : "Échéance"}
          </span>
          <input
            name="release_date"
            maxLength={100}
            placeholder="ex : mars 2027"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Budget indicatif</span>
          <select
            name="budget"
            defaultValue=""
            className={`${fieldCls} [&>option]:bg-[var(--lcd-bg)]`}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className={labelCls}>En quelques mots</span>
        <textarea
          name="message"
          rows={3}
          maxLength={5000}
          placeholder="Le projet, l'ambiance, ce que vous aimeriez provoquer…"
          className={`${fieldCls} resize-none`}
        />
      </label>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {status === "error" ? (
        <p className="text-sm text-[var(--lcd-accent)]">
          L'envoi a échoué.{" "}
          <a href={fallbackHref} className="underline underline-offset-4">
            Envoyer le brief par e-mail
          </a>{" "}
          ou{" "}
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            sur WhatsApp
          </a>
          .
        </p>
      ) : null}

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex items-center justify-center gap-4 border border-[var(--lcd-fg)] bg-[var(--lcd-fg)] px-8 py-5 text-[var(--lcd-bg)] transition-colors hover:bg-transparent hover:text-[var(--lcd-fg)] disabled:opacity-60"
        >
          <span className="text-hairline">
            {status === "sending" ? "Envoi…" : "Envoyer mon brief"}
          </span>
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
        <span className="text-hairline text-[var(--lcd-dim)]">
          Réponse sous 48 h · sans engagement
        </span>
      </div>
    </form>
  );
}

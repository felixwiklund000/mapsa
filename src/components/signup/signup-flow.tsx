"use client";

// Anmälan i fem steg ("Lägg upp ditt företag") med levande förhandsvisning.
// Ett enda <form> – stegen döljs bara, så att allt skickas med till servern.
// Utkastet sparas i localStorage (inom try/catch) så att inget försvinner.
// Laddas bara i webbläsaren (se signup-section.tsx), därför kan utkastet
// läsas direkt när komponenten skapas.

import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, MapPin } from "lucide-react";
import { submitSignup, type SignupState } from "@/app/foretag/actions";
import { AREAS } from "@/lib/areas";
import { CATEGORIES } from "@/lib/categories";
import { EMPTY_SIGNUP, SIGNUP_STEPS, validateSignup, type SignupErrors, type SignupFields } from "@/lib/signup";
import { LivePreview } from "./live-preview";

export const DRAFT_KEY = "mapsa-anmalan-utkast";
const REF_KEY = "mapsa-ref";

type Draft = { fields: SignupFields; step: number };

/** Samma fel utan de angivna fälten. */
function without(e: SignupErrors, ...keys: (keyof SignupErrors)[]): SignupErrors {
  const copy = { ...e };
  for (const k of keys) delete copy[k];
  return copy;
}

function readDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<Draft>;
      const fields = { ...EMPTY_SIGNUP };
      for (const k of Object.keys(EMPTY_SIGNUP) as (keyof SignupFields)[]) {
        const v = d.fields?.[k];
        if (typeof v === "string") (fields as Record<string, string>)[k] = v.slice(0, 400);
      }
      const step = Math.min(Math.max(0, Number(d.step) || 0), SIGNUP_STEPS.length - 1);
      return { fields, step };
    }
  } catch {
    // privat läge / blockerad lagring – börja från början
  }
  return { fields: EMPTY_SIGNUP, step: 0 };
}

/** ?ref=julmarknad sparas för hela besöket och skickas med anmälan. */
function readRef(): string {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    if (fromUrl) sessionStorage.setItem(REF_KEY, fromUrl);
    return fromUrl ?? sessionStorage.getItem(REF_KEY) ?? "";
  } catch {
    return "";
  }
}

const label = "block text-sm font-semibold text-panel";
const input =
  "mt-2 block h-14 w-full rounded-xl border border-sand-deep bg-white px-4 text-lg text-panel placeholder:text-stone/70 focus:border-panel focus:outline-none aria-invalid:border-flame";

export default function SignupFlow() {
  const [initial] = useState(readDraft);
  const [fields, setFields] = useState<SignupFields>(initial.fields);
  const [step, setStep] = useState(initial.step);
  const [clientErrors, setClientErrors] = useState<SignupErrors>({});
  const [started] = useState(() => Date.now());
  const [ref] = useState(readRef);
  const [consent, setConsent] = useState(false);
  const [state, formAction, pending] = useActionState<SignupState, FormData>(submitSignup, null);
  const formRef = useRef<HTMLFormElement>(null);
  const last = SIGNUP_STEPS.length - 1;

  // Serverns fel visas tills man ändrar något i formuläret igen.
  const [shownState, setShownState] = useState<SignupState>(null);
  if (state !== shownState) {
    setShownState(state);
    if (state?.errors) {
      const firstBad = SIGNUP_STEPS.findIndex((s) => s.fields.some((f) => state.errors[f]));
      if (firstBad >= 0) setStep(firstBad);
      setClientErrors(state.errors);
    }
  }
  const errors = clientErrors;

  // Spara utkastet.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ fields, step }));
    } catch {
      // går inte att spara – formuläret funkar ändå
    }
  }, [fields, step]);

  function set<K extends keyof SignupFields>(key: K, value: SignupFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key] || errors.form) setClientErrors((e) => without(e, key, "form"));
  }

  function focusFirstError() {
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]:not([hidden] *), [data-invalid=true]:not([hidden] *)")?.focus());
  }

  function next() {
    const e = validateSignup(fields, SIGNUP_STEPS[step].fields);
    setClientErrors(e);
    if (Object.keys(e).length > 0) return focusFirstError();
    setStep((s) => Math.min(last, s + 1));
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-step="${step + 1}"] input`)?.focus());
  }

  // Enter går till nästa steg i stället för att skicka formuläret i förtid.
  function onKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Enter" && step < last && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
      next();
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (step < last) {
      e.preventDefault();
      next();
      return;
    }
    const all = validateSignup(fields);
    if (!consent) all.samtycke = "Du behöver godkänna att vi sparar uppgifterna.";
    if (Object.keys(all).length > 0) {
      e.preventDefault();
      setClientErrors(all);
      const firstBad = SIGNUP_STEPS.findIndex((s) => s.fields.some((f) => all[f]));
      if (firstBad >= 0 && firstBad !== step) setStep(firstBad);
      focusFirstError();
    }
  }

  const err = (k: keyof SignupErrors) =>
    errors[k] ? (
      <p id={`fel-${k}`} className="mt-2 text-sm font-medium text-flame">
        {errors[k]}
      </p>
    ) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
      {/* Förhandsvisning: överst och klistrad på mobil, till höger på desktop */}
      <LivePreview
        fields={fields}
        className="sticky top-[calc(env(safe-area-inset-top)+64px)] z-10 h-[200px] bg-sand pt-1 pb-3 sm:h-[320px] lg:order-2 lg:top-24 lg:h-[600px] lg:pt-0 lg:pb-0"
      />

      <form
        ref={formRef}
        action={formAction}
        onSubmit={onSubmit}
        onKeyDown={onKeyDown}
        noValidate
        // Fältet man skriver i ska hamna under den klistrade förhandsvisningen (mobil).
        className="lg:order-1 [&_input]:scroll-mt-[300px] sm:[&_input]:scroll-mt-[420px] lg:[&_input]:scroll-mt-28"
      >
        {/* Steg-indikator */}
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-xs tracking-[0.08em] text-stone uppercase">
            Steg {step + 1} av {SIGNUP_STEPS.length} · {SIGNUP_STEPS[step].title}
          </p>
        </div>
        <ol className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden="true">
          {SIGNUP_STEPS.map((s, i) => (
            <li key={s.title} className={`h-1.5 rounded-full transition-colors duration-300 ${i <= step ? "bg-flame" : "bg-sand-deep"}`} />
          ))}
        </ol>

        {/* Dolda fält: robotfälla, starttid och källa */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Lämna tomt
            <input type="text" name="webbplats" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
        <input type="hidden" name="startad" value={started} />
        <input type="hidden" name="kalla" value={ref} />
        <input type="hidden" name="lat" value={fields.lat} />
        <input type="hidden" name="lng" value={fields.lng} />
        <input type="hidden" name="kategori" value={fields.kategori} />

        <div className="mt-8 min-h-[300px]">
          {/* 1. Företaget */}
          <fieldset data-step="0" hidden={step !== 0} className="space-y-6">
            <legend className="sr-only">Företaget</legend>
            <div>
              <label htmlFor="foretagsnamn" className={label}>
                Företagsnamn
              </label>
              <input
                id="foretagsnamn"
                name="foretagsnamn"
                className={input}
                value={fields.foretagsnamn}
                onChange={(e) => set("foretagsnamn", e.target.value)}
                autoComplete="organization"
                placeholder="t.ex. Salong Trossö"
                aria-invalid={Boolean(errors.foretagsnamn)}
                aria-describedby={errors.foretagsnamn ? "fel-foretagsnamn" : undefined}
                maxLength={80}
              />
              {err("foretagsnamn")}
            </div>
            <div role="radiogroup" aria-labelledby="kategori-rubrik" aria-describedby={errors.kategori ? "fel-kategori" : undefined}>
              <p id="kategori-rubrik" className={label}>
                Kategori
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = fields.kategori === c.slug;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      data-invalid={Boolean(errors.kategori) && !fields.kategori}
                      onClick={() => set("kategori", c.slug)}
                      className={`pressable h-11 rounded-full px-4 text-base font-medium transition-colors ${
                        on ? "bg-panel text-white" : "bg-white text-panel ring-1 ring-sand-deep hover:ring-panel/40"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
              {err("kategori")}
            </div>
          </fieldset>

          {/* 2. Adress */}
          <fieldset data-step="1" hidden={step !== 1}>
            <legend className="sr-only">Adress</legend>
            <AddressField
              value={fields.adress}
              placed={fields.lat !== "" && fields.lng !== ""}
              error={errors.adress}
              onType={(v) => setFields((f) => ({ ...f, adress: v, lat: "", lng: "" }))}
              onPick={(a) => {
                setFields((f) => ({ ...f, adress: a.label, lat: String(a.lat), lng: String(a.lng) }));
                setClientErrors((e) => without(e, "adress"));
              }}
            />
          </fieldset>

          {/* 3. Pris */}
          <fieldset data-step="2" hidden={step !== 2} className="space-y-6">
            <legend className="sr-only">Pris</legend>
            <div>
              <label htmlFor="tjanst" className={label}>
                Din billigaste tjänst
              </label>
              <input
                id="tjanst"
                name="tjanst"
                className={input}
                value={fields.tjanst}
                onChange={(e) => set("tjanst", e.target.value)}
                placeholder="t.ex. Klippning"
                aria-invalid={Boolean(errors.tjanst)}
                aria-describedby={errors.tjanst ? "fel-tjanst" : undefined}
                maxLength={80}
              />
              {err("tjanst")}
            </div>
            <div>
              <label htmlFor="pris" className={label}>
                Pris
              </label>
              <div className="relative">
                <input
                  id="pris"
                  name="pris"
                  className={`${input} pr-14`}
                  value={fields.pris}
                  onChange={(e) => set("pris", e.target.value.replace(/[^\d ]/g, ""))}
                  inputMode="numeric"
                  placeholder="250"
                  aria-invalid={Boolean(errors.pris)}
                  aria-describedby={errors.pris ? "fel-pris" : undefined}
                  maxLength={8}
                />
                <span className="pointer-events-none absolute top-1/2 right-4 mt-1 -translate-y-1/2 text-lg text-stone">kr</span>
              </div>
              {err("pris")}
            </div>
          </fieldset>

          {/* 4. Bokning */}
          <fieldset data-step="3" hidden={step !== 3}>
            <legend className="sr-only">Bokning</legend>
            <label htmlFor="bokningslank" className={label}>
              Länk till din bokning
            </label>
            <input
              id="bokningslank"
              name="bokningslank"
              className={input}
              value={fields.bokningslank}
              onChange={(e) => set("bokningslank", e.target.value)}
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="bokadirekt.se/places/…"
              aria-invalid={Boolean(errors.bokningslank)}
              aria-describedby={errors.bokningslank ? "fel-bokningslank" : "bokning-hjalp"}
              maxLength={300}
            />
            {err("bokningslank") ?? (
              <p id="bokning-hjalp" className="mt-2 text-sm text-stone">
                Bokadirekt, Fresha, egen hemsida, Instagram – eller ett telefonnummer.
              </p>
            )}
          </fieldset>

          {/* 5. Kontakt */}
          <fieldset data-step="4" hidden={step !== 4} className="space-y-6">
            <legend className="sr-only">Kontakt</legend>
            <div>
              <label htmlFor="kontaktnamn" className={label}>
                Ditt namn
              </label>
              <input
                id="kontaktnamn"
                name="kontaktnamn"
                className={input}
                value={fields.kontaktnamn}
                onChange={(e) => set("kontaktnamn", e.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(errors.kontaktnamn)}
                aria-describedby={errors.kontaktnamn ? "fel-kontaktnamn" : undefined}
                maxLength={80}
              />
              {err("kontaktnamn")}
            </div>
            <div>
              <label htmlFor="mejl" className={label}>
                Mejl
              </label>
              <input
                id="mejl"
                name="mejl"
                type="email"
                className={input}
                value={fields.mejl}
                onChange={(e) => set("mejl", e.target.value)}
                autoComplete="email"
                inputMode="email"
                autoCapitalize="off"
                aria-invalid={Boolean(errors.mejl)}
                aria-describedby={errors.mejl ? "fel-mejl" : undefined}
                maxLength={160}
              />
              {err("mejl")}
            </div>
            <div>
              <label htmlFor="telefon" className={label}>
                Telefon <span className="font-normal text-stone">(valfritt)</span>
              </label>
              <input
                id="telefon"
                name="telefon"
                type="tel"
                className={input}
                value={fields.telefon}
                onChange={(e) => set("telefon", e.target.value)}
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={Boolean(errors.telefon)}
                aria-describedby={errors.telefon ? "fel-telefon" : undefined}
                maxLength={20}
              />
              {err("telefon")}
            </div>
            <div>
              <label className="flex cursor-pointer items-start gap-3 text-base text-panel">
                <input
                  type="checkbox"
                  name="samtycke"
                  value="ja"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setClientErrors((e) => without(e, "samtycke"));
                  }}
                  aria-invalid={Boolean(errors.samtycke)}
                  aria-describedby={errors.samtycke ? "fel-samtycke" : undefined}
                  className="mt-0.5 size-6 shrink-0 accent-flame"
                />
                <span>
                  Jag godkänner att Mapsa sparar uppgifterna enligt{" "}
                  <a href="/integritet" target="_blank" className="font-semibold underline underline-offset-4">
                    integritetspolicyn
                  </a>
                  .
                </span>
              </label>
              {err("samtycke")}
            </div>
          </fieldset>
        </div>

        {errors.form && (
          <p role="alert" className="mt-6 rounded-xl bg-flame/10 px-4 py-3 text-base font-medium text-panel">
            {errors.form}
          </p>
        )}

        {/* Knappar */}
        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                setClientErrors({});
                setStep((s) => Math.max(0, s - 1));
              }}
              className="pressable flex h-14 items-center gap-2 rounded-full px-5 text-base font-medium text-panel ring-1 ring-sand-deep hover:bg-white"
            >
              <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
              Tillbaka
            </button>
          )}
          {step < last ? (
            <button
              type="button"
              onClick={next}
              className="pressable flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-panel px-6 text-lg font-medium text-white sm:flex-none sm:px-8"
            >
              Nästa
              <ArrowRight className="size-5" strokeWidth={2} aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="pressable flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-flame px-6 text-lg font-medium text-white shadow-[0_8px_24px_-8px_rgb(255_90_31/0.7)] disabled:opacity-70 sm:flex-none sm:px-8"
            >
              {pending ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" aria-hidden />
                  Skickar …
                </>
              ) : (
                <>
                  Skicka in
                  <Check className="size-5" strokeWidth={2.25} aria-hidden />
                </>
              )}
            </button>
          )}
        </div>
        {step === last && (
          <p className="mt-4 text-sm text-stone">
            Gratis första månaden. Inget betalkort. Vi granskar och hör av oss inom 48 timmar.
          </p>
        )}
      </form>
    </div>
  );
}

// ---------- Adress med förslag ----------

type Suggestion = { label: string; lat: number; lng: number };

function AddressField({
  value,
  placed,
  error,
  onType,
  onPick,
}: {
  value: string;
  placed: boolean;
  error?: string;
  onType: (v: string) => void;
  onPick: (s: Suggestion) => void;
}) {
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [active, setActive] = useState(-1);
  const [showAreas, setShowAreas] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abort = useRef<AbortController>(undefined);

  function search(q: string) {
    clearTimeout(timer.current);
    abort.current?.abort();
    if (q.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abort.current = ctrl;
      try {
        const res = await fetch(`/api/adress?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: Suggestion[]; error?: string };
        setUnavailable(Boolean(data.error));
        setResults(data.results);
        setActive(-1);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setUnavailable(true);
          setOpen(true);
        }
      }
    }, 300);
  }

  function pick(s: Suggestion) {
    onPick(s);
    setOpen(false);
    setResults([]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      e.stopPropagation();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const noHits = open && !unavailable && results.length === 0;

  return (
    <div>
      <label htmlFor="adress" className={label}>
        Adress
      </label>
      <div className="relative">
        <input
          id="adress"
          name="adress"
          className={`${input} pr-12`}
          value={value}
          onChange={(e) => {
            onType(e.target.value);
            search(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
          placeholder="Gatuadress och ort"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="adress-forslag"
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `adress-${active}` : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "fel-adress" : undefined}
          maxLength={160}
        />
        {placed && <MapPin className="absolute top-1/2 right-4 mt-1 size-5 -translate-y-1/2 text-flame" strokeWidth={2.25} aria-label="Placerad på kartan" />}
        {open && results.length > 0 && (
          <ul
            id="adress-forslag"
            role="listbox"
            className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-sand-deep bg-white py-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.3)]"
          >
            {results.map((r, i) => (
              <li
                key={r.label}
                id={`adress-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(r)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-base text-panel ${i === active ? "bg-sand" : "hover:bg-sand-light"}`}
              >
                <MapPin className="size-4 shrink-0 text-stone" strokeWidth={2} aria-hidden />
                {r.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error ? (
        <p id="fel-adress" className="mt-2 text-sm font-medium text-flame">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-sm text-stone">
          {unavailable ? "Adressförslagen svarar inte just nu." : noHits ? "Hittade ingen sådan adress i Blekinge." : "Skriv och välj i listan – kartan flyger dit."}
        </p>
      )}

      <div className="mt-6">
        {!showAreas ? (
          <button type="button" onClick={() => setShowAreas(true)} className="text-sm font-semibold text-panel underline underline-offset-4">
            Hittar du inte adressen? Välj område i stället
          </button>
        ) : (
          <div>
            <label htmlFor="omrade" className={label}>
              Område
            </label>
            <select
              id="omrade"
              className={`${input} appearance-none`}
              defaultValue=""
              onChange={(e) => {
                const a = AREAS.find((x) => x.name === e.target.value);
                if (a) pick({ label: a.name === a.kommun ? a.name : `${a.name}, ${a.kommun}`, lat: a.lat, lng: a.lng });
              }}
            >
              <option value="" disabled>
                Välj område …
              </option>
              {AREAS.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name === a.kommun ? a.name : `${a.name}, ${a.kommun}`}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-stone">Prislappen hamnar mitt i området. Vi justerar läget när vi granskar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

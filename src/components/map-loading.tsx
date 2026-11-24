import { MapsaMark } from "./brand";

// Laddvy för kartan: sidans ljusa ton (samma som kartans mark) med Mapsa-
// symbolen, så att man aldrig ser en grå eller tom karta. Tonar bort på
// 200 ms när kartan är laddad (direkt vid reducerad rörelse).
export function MapLoading({ state = "loading" }: { state?: "loading" | "done" | "failed" }) {
  const done = state === "done";
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={done || undefined}
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#f6f4ef] text-stone transition-[opacity,visibility] duration-200 ease-out motion-reduce:transition-none ${
        done ? "invisible opacity-0" : ""
      }`}
    >
      <MapsaMark className="w-7 text-flame" />
      <p className="text-sm font-medium">{state === "failed" ? "Kartan kunde inte laddas" : done ? "" : "Laddar kartan…"}</p>
    </div>
  );
}

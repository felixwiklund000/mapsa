"use client";

// Tömmer anmälans utkast när den skickats in (visas på /foretag/tack).
import { useEffect } from "react";

export function ClearDraft() {
  useEffect(() => {
    try {
      localStorage.removeItem("mapsa-anmalan-utkast");
    } catch {
      // inget att göra
    }
  }, []);
  return null;
}

"use client";

// Formuläret laddas bara i webbläsaren: det läser utkastet ur localStorage
// och visar kartan (WebGL). Platshållaren håller samma höjd så att sidan inte hoppar.

import dynamic from "next/dynamic";

export const SignupSection = dynamic(() => import("./signup-flow"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12" aria-busy="true">
      <div className="h-[200px] rounded-3xl bg-sand-deep sm:h-[320px] lg:order-2 lg:h-[600px]" />
      <div className="h-[420px] lg:order-1" />
    </div>
  ),
});

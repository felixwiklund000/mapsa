"use client";

// 3D-scenerna laddas bara i webbläsaren och först när sidan behöver dem –
// three.js hamnar i en egen fil som inte bromsar resten av sidan.

import dynamic from "next/dynamic";

export const CityScene = dynamic(() => import("./city-scene"), { ssr: false });
export const ClicksScene = dynamic(() => import("./clicks-scene"), { ssr: false });

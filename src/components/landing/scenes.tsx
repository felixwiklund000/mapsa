"use client";

// 3D-staden laddas bara i webbläsaren och först när sidan behöver den –
// three.js hamnar i en egen fil som inte bromsar resten av sidan.

import dynamic from "next/dynamic";

export const CityScene = dynamic(() => import("./city-scene"), { ssr: false });

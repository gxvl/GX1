// GX1 is fictional. Every spec, finish, kit and price here is invented for the showcase.

export const finishes = [
  {
    id: "graphite",
    name: "Graphite",
    body: "#2a2c2f",
    shade: "#151618",
    light: "#4a4d52",
  },
  {
    id: "chalk",
    name: "Chalk",
    body: "#e6e2d9",
    shade: "#b9b4a8",
    light: "#fbfaf6",
  },
  {
    id: "signal",
    name: "Signal",
    body: "#ffd400",
    shade: "#c9a400",
    light: "#ffe866",
  },
] as const;

export const kits = [
  {
    id: "solo",
    name: "Solo",
    priceUsd: 449,
    contents: ["GX1 camera", "Wrist strap", "USB-C cable"],
  },
  {
    id: "creator",
    name: "Creator kit",
    priceUsd: 569,
    contents: ["GX1 camera", "Wireless clip mic", "Mini tripod grip", "Carry pouch"],
  },
  {
    id: "studio",
    name: "Studio kit",
    priceUsd: 709,
    contents: [
      "GX1 camera",
      "Two wireless clip mics",
      "Battery grip",
      "ND filter set",
      "Hard case",
    ],
  },
] as const;

export type FinishId = (typeof finishes)[number]["id"];
export type KitId = (typeof kits)[number]["id"];
export type Finish = (typeof finishes)[number];
export type Kit = (typeof kits)[number];

export const finishIds = finishes.map((f) => f.id) as [FinishId, ...FinishId[]];
export const kitIds = kits.map((k) => k.id) as [KitId, ...KitId[]];

export function getFinish(id: unknown): Finish {
  return finishes.find((f) => f.id === id) ?? finishes[0];
}

export function getKit(id: unknown): Kit {
  return kits.find((k) => k.id === id) ?? kits[1];
}

export const specs = [
  { label: "Sensor", value: '1-inch CMOS' },
  { label: "Video", value: "4K 120 fps · 10-bit" },
  { label: "Stabilization", value: "3-axis mechanical gimbal" },
  { label: "Display", value: '2.0" OLED, rotates' },
  { label: "Battery", value: "150 min at 4K 30" },
  { label: "Audio", value: "Stereo mics + wireless pairing" },
  { label: "Storage", value: "microSD up to 1 TB" },
  { label: "Weight", value: "118 g" },
] as const;

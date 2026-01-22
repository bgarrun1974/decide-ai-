"use client";

import React, { useMemo, useState } from "react";
import phonesData from "@/data/phones.us.json";
import { TopNav, type TopCategory } from "@/components/layout/TopNav";
import { SubCategoryNav, type ElectronicsSub } from "@/components/layout/SubCategoryNav";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";

type OSMode = "iOS" | "All" | "Android";
type ConditionMode = "New" | "All" | "Used";
type ScreenClass = "small" | "medium" | "large" | "all";

type TraitKey =
  | "performance"
  | "battery"
  | "camera"
  | "display"
  | "build"
  | "reliability"
  | "software"
  | "safety"
  | "design"
  | "value";

type Weights = Record<TraitKey, number>;
type SubWeights = Partial<Record<TraitKey, Record<string, number>>>;

type Phone = {
  id: string;
  brand: string;
  model: string;
  os: "iOS" | "Android";
  releaseYear?: number;
  availability?: ("new" | "used")[];
  price: { new?: number; used?: number };
  screen: { sizeIn: number; class: "small" | "medium" | "large" };
  traits: Record<TraitKey, number>;
  strengthTags?: string[];
  imageUrl?: string; // optional (add in JSON)
};

const ALL_PHONES: Phone[] = (phonesData as any).phones ?? [];

const DIAL_ORDER: TraitKey[] = [
  "performance",
  "camera",
  "battery",
  "display",
  "reliability",
  "value",
  "software",
  "safety",
  "build",
  "design",
];

const LABELS: Record<TraitKey, string> = {
  performance: "Performance",
  battery: "Battery",
  camera: "Camera",
  display: "Display",
  build: "Build",
  reliability: "Reliability",
  software: "Software",
  safety: "Safety",
  design: "Design",
  value: "Value",
};

// Sub-dials per category (UI + optional scaling effect)
const SUB_DIALS: Record<TraitKey, { key: string; label: string; tip: string }[]> = {
  performance: [
    { key: "cpu", label: "CPU/GPU speed", tip: "How much raw speed matters." },
    { key: "ram", label: "RAM / multitasking", tip: "Keep many apps open smoothly." },
    { key: "thermals", label: "Sustained performance", tip: "Avoid throttling." },
  ],
  camera: [
    { key: "photo", label: "Main photo quality", tip: "Day-to-day photos." },
    { key: "selfie", label: "Selfie quality", tip: "Front camera importance." },
    { key: "video", label: "Video quality", tip: "Stabilization & clarity." },
  ],
  battery: [
    { key: "endurance", label: "All-day endurance", tip: "Hours per charge." },
    { key: "charging", label: "Fast charging", tip: "How important quick top-ups are." },
    { key: "longevity", label: "Battery health over years", tip: "Degradation tolerance." },
  ],
  display: [
    { key: "brightness", label: "Brightness", tip: "Outdoor visibility." },
    { key: "smoothness", label: "Refresh rate", tip: "Scrolling smoothness." },
    { key: "quality", label: "Color/sharpness", tip: "Overall panel quality." },
  ],
  reliability: [
    { key: "stability", label: "Stability", tip: "Low crash/bug tolerance." },
    { key: "durability", label: "Durability", tip: "Survive drops/abuse." },
    { key: "support", label: "Service/support", tip: "Ease of repair/warranty." },
  ],
  value: [
    { key: "price", label: "Upfront price", tip: "Lower cost matters." },
    { key: "resale", label: "Resale value", tip: "Value retention." },
    { key: "tco", label: "Total cost of ownership", tip: "Case, repairs, battery, etc." },
  ],
  software: [
    { key: "updates", label: "Update longevity", tip: "Years of updates." },
    { key: "features", label: "Software features", tip: "AI, camera features, etc." },
    { key: "bloat", label: "Low bloat", tip: "Clean, fast UI." },
  ],
  safety: [
    { key: "emergency", label: "Emergency features", tip: "SOS/crash detection, etc." },
    { key: "security", label: "Security", tip: "Privacy/security features." },
    { key: "family", label: "Family controls", tip: "Teen/kids controls." },
  ],
  build: [
    { key: "materials", label: "Materials", tip: "Glass/metal feel." },
    { key: "water", label: "Water resistance", tip: "IP rating importance." },
    { key: "fit", label: "Fit/finish", tip: "Buttons, rigidity, tolerances." },
  ],
  design: [
    { key: "look", label: "Looks", tip: "Aesthetics." },
    { key: "handfeel", label: "Hand feel", tip: "Comfort in hand." },
    { key: "weight", label: "Weight", tip: "Lighter vs heavier preference." },
  ],
};

const DEFAULT_WEIGHTS: Weights = {
  performance: 7,
  battery: 7,
  camera: 7,
  display: 6,
  build: 6,
  reliability: 8,
  software: 7,
  safety: 7,
  design: 5,
  value: 7,
};

const PRESETS: Record<string, { weights: Weights }> = {
  "Teen / Student": {
    weights: {
      performance: 7,
      battery: 8,
      camera: 9,
      display: 7,
      build: 5,
      reliability: 7,
      software: 6,
      safety: 6,
      design: 7,
      value: 8,
    },
  },
  "Power User": {
    weights: {
      performance: 10,
      battery: 7,
      camera: 7,
      display: 8,
      build: 6,
      reliability: 7,
      software: 6,
      safety: 6,
      design: 6,
      value: 5,
    },
  },
  "Value Buyer": {
    weights: {
      performance: 6,
      battery: 7,
      camera: 6,
      display: 6,
      build: 6,
      reliability: 8,
      software: 6,
      safety: 6,
      design: 5,
      value: 10,
    },
  },
  "Camera First": {
    weights: {
      performance: 7,
      battery: 7,
      camera: 10,
      display: 7,
      build: 6,
      reliability: 7,
      software: 6,
      safety: 6,
      design: 6,
      value: 6,
    },
  },
  Business: {
    weights: {
      performance: 7,
      battery: 8,
      camera: 6,
      display: 6,
      build: 7,
      reliability: 9,
      software: 9,
      safety: 8,
      design: 5,
      value: 7,
    },
  },
  Gamer: {
    weights: {
      performance: 10,
      battery: 8,
      camera: 6,
      display: 9,
      build: 6,
      reliability: 7,
      software: 6,
      safety: 6,
      design: 5,
      value: 6,
    },
  },
};

type BasicsState = {
  os: OSMode;
  condition: ConditionMode;
  budgetMin: number;
  budgetMax: number;
  screen: ScreenClass;
  excludedBrands: string[];
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function effectivePrice(phone: Phone, condition: ConditionMode): number | null {
  const pNew = phone.price?.new;
  const pUsed = phone.price?.used;

  if (condition === "New") return typeof pNew === "number" ? pNew : null;
  if (condition === "Used") return typeof pUsed === "number" ? pUsed : null;

  const candidates = [pNew, pUsed].filter((x) => typeof x === "number") as number[];
  if (!candidates.length) return null;
  return Math.min(...candidates);
}

function matchesOS(phone: Phone, os: OSMode) {
  if (os === "All") return true;
  return phone.os === os;
}

function matchesScreen(phone: Phone, screen: ScreenClass) {
  if (screen === "all") return true;
  return phone.screen?.class === screen;
}

function matchesBrandExclusion(phone: Phone, excluded: string[]) {
  if (!excluded.length) return true;
  const b = phone.brand.toLowerCase();
  return !excluded.some((x) => x.toLowerCase() === b);
}

// Subweights affect the parent category by scaling its weight (meaningful even without sub-traits)
function effectiveWeights(weights: Weights, subWeights: SubWeights): Weights {
  const out: Weights = { ...weights };
  (Object.keys(weights) as TraitKey[]).forEach((k) => {
    const subs = subWeights[k];
    if (!subs) return;
    const vals = Object.values(subs);
    if (!vals.length) return;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length; // 1..10
    out[k] = clamp(Math.round((weights[k] * avg) / 10), 1, 10);
  });
  return out;
}

function scorePhone(phone: Phone, weights: Weights): number {
  const entries = Object.entries(weights) as [TraitKey, number][];
  const wSum = entries.reduce((s, [, w]) => s + w, 0);
  if (wSum <= 0) return 0;

  const raw = entries.reduce((s, [k, w]) => s + (phone.traits[k] ?? 0) * w, 0) / wSum;
  return clamp(Math.round(raw), 0, 100);
}

function topWhyBullets(phone: Phone, weights: Weights, basics: BasicsState): string[] {
  const rankedCats = (Object.keys(weights) as TraitKey[])
    .map((k) => ({ k, w: weights[k], t: phone.traits[k] ?? 0 }))
    .sort((a, b) => b.w * b.t - a.w * a.t)
    .slice(0, 2);

  const bullets: string[] = rankedCats.map((x) => `Strong on ${LABELS[x.k]} (high priority).`);

  const price = effectivePrice(phone, basics.condition);
  const constraintBits: string[] = [];
  if (basics.os !== "All") constraintBits.push(`OS: ${phone.os}`);
  if (price !== null) constraintBits.push(`Price: ~$${price}`);
  if (basics.screen !== "all") constraintBits.push(`Size: ${phone.screen.class}`);

  if (constraintBits.length) bullets.push(`Fits constraints (${constraintBits.slice(0, 2).join(", ")}).`);
  else if (phone.strengthTags?.length) bullets.push(phone.strengthTags[0]);

  return bullets.slice(0, 3);
}

function Pill3(props: {
  label: string;
  value: string;
  a: string;
  b: string;
  c: string;
  onChange: (v: string) => void;
  title?: string;
}) {
  const { label, value, a, b, c, onChange, title } = props;
  const items = [a, b, c];
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="text-xs font-semibold text-slate-700">{label}</div>
        <span className="text-xs text-slate-400" title={title}>
          ⓘ
        </span>
      </div>
      <div className="inline-flex rounded-full border bg-white p-0.5">
        {items.map((x) => {
          const active = x === value;
          return (
            <button
              key={x}
              type="button"
              onClick={() => onChange(x)}
              className={[
                "rounded-full px-3 py-1 text-xs transition",
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {x}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  const [topCategory, setTopCategory] = useState<TopCategory>("Electronics");
  const [subCategory, setSubCategory] = useState<ElectronicsSub>("Phones");

  const [basics, setBasics] = useState<BasicsState>({
    os: "All",
    condition: "All",
    budgetMin: 250,
    budgetMax: 1000,
    screen: "all",
    excludedBrands: [],
  });

  // Budget input UX fix: keep text state while typing; commit on blur/Enter
  const [budgetMinText, setBudgetMinText] = useState(String(basics.budgetMin));
  const [budgetMaxText, setBudgetMaxText] = useState(String(basics.budgetMax));

  const commitBudget = (which: "min" | "max") => {
    setBasics((s) => {
      const minRaw = which === "min" ? budgetMinText : String(s.budgetMin);
      const maxRaw = which === "max" ? budgetMaxText : String(s.budgetMax);

      const parsedMin = clamp(parseInt(minRaw || "0", 10) || 0, 0, 5000);
      const parsedMax = clamp(parseInt(maxRaw || "0", 10) || 0, 0, 5000);

      const min = which === "min" ? parsedMin : s.budgetMin;
      const max = which === "max" ? parsedMax : s.budgetMax;

      const fixedMin = clamp(min, 0, max);
      const fixedMax = clamp(max, fixedMin, 5000);

      // keep text in sync
      setBudgetMinText(String(fixedMin));
      setBudgetMaxText(String(fixedMax));

      return { ...s, budgetMin: fixedMin, budgetMax: fixedMax };
    });
  };

  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [subWeights, setSubWeights] = useState<SubWeights>({});
  const [openDial, setOpenDial] = useState<TraitKey | null>(null);

  const effW = useMemo(() => effectiveWeights(weights, subWeights), [weights, subWeights]);

  const ranked = useMemo(() => {
    return ALL_PHONES
      .filter((p) => matchesOS(p, basics.os))
      .filter((p) => matchesScreen(p, basics.screen))
      .filter((p) => matchesBrandExclusion(p, basics.excludedBrands))
      .map((p) => ({ phone: p, price: effectivePrice(p, basics.condition) }))
      .filter((x) => x.price !== null)
      .filter((x) => (x.price as number) >= basics.budgetMin && (x.price as number) <= basics.budgetMax)
      .map((x) => ({ ...x, score: scorePhone(x.phone, effW) }))
      .sort((a, b) => b.score - a.score);
  }, [basics, effW]);

  const top10 = ranked.slice(0, 10);

  const LeftBasics = (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold">Basics</div>
        <div className="text-xs text-slate-500">Presets + constraints. Everything updates live.</div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700">Presets</div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setWeights(PRESETS[name].weights)}
              className="rounded-full border bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
              title="Apply preset weights"
            >
              {name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setWeights(DEFAULT_WEIGHTS);
              setSubWeights({});
            }}
            className="rounded-full border bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            title="Reset weights"
          >
            Reset
          </button>
        </div>
      </div>

      <Pill3
        label="OS"
        value={basics.os}
        a="iOS"
        b="All"
        c="Android"
        onChange={(v) => setBasics((s) => ({ ...s, os: v as OSMode }))}
        title="Filters phones by OS."
      />

      <Pill3
        label="Condition"
        value={basics.condition}
        a="New"
        b="All"
        c="Used"
        onChange={(v) => setBasics((s) => ({ ...s, condition: v as ConditionMode }))}
        title="New vs used affects available prices."
      />

      {/* Budget: text inputs with commit */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700">Budget</div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-600">
            Min
            <input
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              inputMode="numeric"
              value={budgetMinText}
              onChange={(e) => setBudgetMinText(e.target.value.replace(/[^\d]/g, ""))}
              onBlur={() => commitBudget("min")}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitBudget("min");
              }}
            />
          </label>
          <label className="text-xs text-slate-600">
            Max
            <input
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              inputMode="numeric"
              value={budgetMaxText}
              onChange={(e) => setBudgetMaxText(e.target.value.replace(/[^\d]/g, ""))}
              onBlur={() => commitBudget("max")}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitBudget("max");
              }}
            />
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-700">Screen size</div>
        <div className="flex flex-wrap gap-2">
          {(["all", "small", "medium", "large"] as ScreenClass[]).map((s) => {
            const active = basics.screen === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setBasics((x) => ({ ...x, screen: s }))}
                className={[
                  "rounded-full border px-3 py-1 text-xs transition",
                  active ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand exclude */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700">Exclude brands (optional)</div>
        <div className="flex flex-wrap gap-2">
          {basics.excludedBrands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() =>
                setBasics((s) => ({ ...s, excludedBrands: s.excludedBrands.filter((x) => x !== b) }))
              }
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200"
              title="Click to remove"
            >
              {b} ✕
            </button>
          ))}
        </div>

        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Type a brand and press Enter (e.g., Samsung)"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const v = (e.currentTarget.value || "").trim();
            if (!v) return;
            e.currentTarget.value = "";
            setBasics((s) => {
              const exists = s.excludedBrands.some((x) => x.toLowerCase() === v.toLowerCase());
              if (exists) return s;
              return { ...s, excludedBrands: [...s.excludedBrands, v] };
            });
          }}
        />
      </div>

      <div className="pt-2 text-xs text-slate-500">
        DEBUG: phones loaded = <b className="text-slate-700">{ALL_PHONES.length}</b> • matches ={" "}
        <b className="text-slate-700">{ranked.length}</b>
      </div>
    </div>
  );

  const CenterDials = (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold">Weights</div>
        <div className="text-xs text-slate-500">
          Fixed order (no auto-moving). Use arrows to open sub-dials.
        </div>
      </div>

      {DIAL_ORDER.map((k) => {
        const label = LABELS[k];
        const isOpen = openDial === k;

        const subs = SUB_DIALS[k] || [];
        const subObj = subWeights[k] || {};
        const subAvg =
          subs.length > 0
            ? Math.round(
                (subs.reduce((s, d) => s + (subObj[d.key] ?? 10), 0) / subs.length) * 10
              ) / 10
            : 10;

        return (
          <div key={k} className="rounded-xl border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenDial((cur) => (cur === k ? null : k))}
                  className="rounded-md border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  title="Open sub-weights"
                >
                  {isOpen ? "▾" : "▸"}
                </button>
                <div className="text-xs font-semibold text-slate-800">{label}</div>
                <span className="text-xs text-slate-400" title="Slide 1–10. Higher = more important.">
                  ⓘ
                </span>
              </div>

              <div className="text-xs text-slate-600" title="Effective weight (including sub-dials)">
                {effW[k]}/10
              </div>
            </div>

            <input
              className="mt-2 w-full"
              type="range"
              min={1}
              max={10}
              value={weights[k]}
              onChange={(e) => setWeights((s) => ({ ...s, [k]: Number(e.target.value) }))}
            />

            {/* Sub-dials */}
            {isOpen && subs.length > 0 && (
              <div className="mt-3 space-y-2 rounded-lg border bg-slate-50 p-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-700">Sub-weights</div>
                  <div className="text-xs text-slate-500" title="Average of sub-dials scales the parent weight">
                    avg {subAvg}/10
                  </div>
                </div>

                {subs.map((d) => {
                  const v = subObj[d.key] ?? 10;
                  return (
                    <div key={d.key} className="rounded-lg bg-white p-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-700">
                          {d.label}{" "}
                          <span className="text-slate-400" title={d.tip}>
                            ⓘ
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">{v}/10</div>
                      </div>
                      <input
                        className="mt-1 w-full"
                        type="range"
                        min={1}
                        max={10}
                        value={v}
                        onChange={(e) => {
                          const nv = Number(e.target.value);
                          setSubWeights((s) => ({
                            ...s,
                            [k]: { ...(s[k] || {}), [d.key]: nv },
                          }));
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const RightResults = (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Top Matches</div>
          <div className="text-xs text-slate-500">Ranked from basics + weights.</div>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
          {ranked.length} matches
        </div>
      </div>

      {top10.length === 0 ? (
        <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
          No matches. Try widening budget, allowing Used/All, or removing exclusions.
        </div>
      ) : (
        <div className="space-y-3">
          {top10.map(({ phone, price, score }, i) => {
            const why = topWhyBullets(phone, effW, basics);
            return (
              <div key={phone.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Optional image */}
                    {phone.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={phone.imageUrl}
                        alt={`${phone.brand} ${phone.model}`}
                        className="h-14 w-14 rounded-lg border object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg border bg-slate-50" />
                    )}

                    <div>
                      <div className="text-sm font-semibold">
                        {i + 1}. {phone.brand} {phone.model}
                      </div>
                      <div className="text-xs text-slate-500">
                        {phone.os} • {phone.screen.sizeIn.toFixed(1)}" • ~${price as number}
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-200"
                    title="Match score is a weighted average of your priorities."
                  >
                    {score}%
                  </div>
                </div>

                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-700">
                  {why.map((w, idx2) => (
                    <li key={idx2}>{w}</li>
                  ))}
                </ul>

                {phone.strengthTags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {phone.strengthTags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <TopNav active={topCategory} onChange={setTopCategory} />
      {topCategory === "Electronics" && (
        <SubCategoryNav active={subCategory} onChange={setSubCategory} />
      )}

      <ThreeColumnLayout left={LeftBasics} center={CenterDials} right={RightResults} />
    </div>
  );
}

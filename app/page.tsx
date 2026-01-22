"use client";

import React, { useMemo, useState } from "react";
import phonesData from "@/data/phones.us.json";
import { TopNav, type TopCategory } from "@/components/layout/TopNav";
import { SubCategoryNav, type ElectronicsSub } from "@/components/layout/SubCategoryNav";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";

/**
 * Minimal end-to-end MVP:
 * Basics (left) -> Weights (center) -> Ranked results (right)
 * Uses local JSON only (no backend).
 */

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
};

const ALL_PHONES: Phone[] = (phonesData as any).phones ?? [];

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

function scorePhone(phone: Phone, weights: Weights): number {
  const entries = Object.entries(weights) as [TraitKey, number][];
  const wSum = entries.reduce((s, [, w]) => s + w, 0);
  if (wSum <= 0) return 0;

  const raw =
    entries.reduce((s, [k, w]) => s + (phone.traits[k] ?? 0) * w, 0) / wSum;

  return clamp(Math.round(raw), 0, 100);
}

function topWhyBullets(phone: Phone, weights: Weights, basics: BasicsState): string[] {
  const rankedCats = (Object.keys(weights) as TraitKey[])
    .map((k) => ({ k, w: weights[k], t: phone.traits[k] ?? 0 }))
    .sort((a, b) => b.w - a.w);

  const strong = rankedCats
    .filter((x) => x.w >= 6)
    .sort((a, b) => b.w * b.t - a.w * a.t)
    .slice(0, 2);

  const bullets: string[] = strong.map((x) => {
    const label = x.k.charAt(0).toUpperCase() + x.k.slice(1);
    return `Strong match on ${label} (you weighted it highly).`;
  });

  const price = effectivePrice(phone, basics.condition);
  const constraintBits: string[] = [];
  if (basics.os !== "All") constraintBits.push(`OS: ${phone.os}`);
  if (price !== null) constraintBits.push(`Price: ~$${price}`);
  if (basics.screen !== "all") constraintBits.push(`Size: ${phone.screen.class}`);

  if (constraintBits.length) bullets.push(`Fits your constraints (${constraintBits.slice(0, 2).join(", ")}).`);
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
        <span className="text-xs text-slate-400" title={title}>ⓘ</span>
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

  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);

  const dialOrder = useMemo(() => {
    const keys = Object.keys(weights) as TraitKey[];
    return keys.sort((a, b) => weights[b] - weights[a]);
  }, [weights]);

  const ranked = useMemo(() => {
    return ALL_PHONES
      .filter((p) => matchesOS(p, basics.os))
      .filter((p) => matchesScreen(p, basics.screen))
      .filter((p) => matchesBrandExclusion(p, basics.excludedBrands))
      .map((p) => ({ phone: p, price: effectivePrice(p, basics.condition) }))
      .filter((x) => x.price !== null)
      .filter((x) => (x.price as number) >= basics.budgetMin && (x.price as number) <= basics.budgetMax)
      .map((x) => ({ ...x, score: scorePhone(x.phone, weights) }))
      .sort((a, b) => b.score - a.score);
  }, [basics, weights]);

  const top10 = ranked.slice(0, 10);

  const LeftBasics = (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold">Basics</div>
        <div className="text-xs text-slate-500">Set constraints first. Everything updates live.</div>
      </div>

      <Pill3
        label="OS"
        value={basics.os}
        a="iOS"
        b="All"
        c="Android"
        onChange={(v) => setBasics((s) => ({ ...s, os: v as OSMode }))}
        title="Filters phones by OS. All shows both."
      />

      <Pill3
        label="Condition"
        value={basics.condition}
        a="New"
        b="All"
        c="Used"
        onChange={(v) => setBasics((s) => ({ ...s, condition: v as ConditionMode }))}
        title="New vs Used affects available prices."
      />

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700">Budget</div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-600">
            Min
            <input
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              type="number"
              value={basics.budgetMin}
              onChange={(e) =>
                setBasics((s) => {
                  const min = clamp(Number(e.target.value || 0), 0, s.budgetMax);
                  return { ...s, budgetMin: min };
                })
              }
            />
          </label>
          <label className="text-xs text-slate-600">
            Max
            <input
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              type="number"
              value={basics.budgetMax}
              onChange={(e) =>
                setBasics((s) => {
                  const max = clamp(Number(e.target.value || 0), s.budgetMin, 5000);
                  return { ...s, budgetMax: max };
                })
              }
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

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700">Exclude brands (optional)</div>
        <div className="flex flex-wrap gap-2">
          {basics.excludedBrands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBasics((s) => ({ ...s, excludedBrands: s.excludedBrands.filter((x) => x !== b) }))}
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
        <div className="text-xs text-slate-500">Highest priorities float to the top.</div>
      </div>

      {dialOrder.map((k, idx) => {
        const isTop5 = idx < 5;
        const label = k.charAt(0).toUpperCase() + k.slice(1);
        return (
          <div
            key={k}
            className={["rounded-xl border p-3", isTop5 ? "bg-white" : "bg-white/70"].join(" ")}
            style={{ opacity: isTop5 ? 1 : 0.72 }}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-800">{label}</div>
              <div className="text-xs text-slate-600">{weights[k]}/10</div>
            </div>
            <input
              className="mt-2 w-full"
              type="range"
              min={1}
              max={10}
              value={weights[k]}
              onChange={(e) => setWeights((s) => ({ ...s, [k]: Number(e.target.value) }))}
            />
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
          <div className="text-xs text-slate-500">Ranked from your basics + weights.</div>
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
            const why = topWhyBullets(phone, weights, basics);
            return (
              <div key={phone.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      {i + 1}. {phone.brand} {phone.model}
                    </div>
                    <div className="text-xs text-slate-500">
                      {phone.os} • {phone.screen.sizeIn.toFixed(1)}" • ~${price as number}
                    </div>
                  </div>
                  <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-200">
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
      {topCategory === "Electronics" && <SubCategoryNav active={subCategory} onChange={setSubCategory} />}

      <ThreeColumnLayout left={LeftBasics} center={CenterDials} right={RightResults} />
    </div>
  );
}

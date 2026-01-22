"use client";

import React from "react";

export type TopCategory =
  | "Electronics"
  | "Appliances"
  | "Autos"
  | "Furniture"
  | "Travel"
  | "Home Systems";

const TOP_CATEGORIES: TopCategory[] = [
  "Electronics",
  "Appliances",
  "Autos",
  "Furniture",
  "Travel",
  "Home Systems",
];

export function TopNav(props: {
  active: TopCategory;
  onChange: (c: TopCategory) => void;
}) {
  const { active, onChange } = props;

  return (
    <div className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        {/* Brand */}
        <div className="min-w-[220px]">
          <div className="flex items-baseline gap-2">
            <div className="text-lg font-bold tracking-tight">Decide.AI</div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              beta
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Make expensive decisions fast — and confidently.
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {TOP_CATEGORIES.map((c) => {
            const isActive = c === active;
            const isTeaser = c !== "Electronics"; // only Electronics live for now

            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  if (isTeaser) {
                    // teaser behavior (no routing yet)
                    alert("Coming soon — high-value decisions over $250.");
                    return;
                  }
                  onChange(c);
                }}
                className={[
                  "rounded-full px-3 py-1 text-sm transition",
                  isActive
                    ? "bg-blue-50 text-blue-800 ring-1 ring-blue-300"
                    : "text-slate-600 hover:bg-slate-50",
                  isTeaser ? "opacity-70" : "",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
                title={isTeaser ? "Coming soon" : undefined}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

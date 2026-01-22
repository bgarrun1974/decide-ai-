"use client";

import React from "react";

export type ElectronicsSub = "Phones" | "Laptops" | "TVs" | "Wearables" | "Audio";

const SUBS: ElectronicsSub[] = ["Phones", "Laptops", "TVs", "Wearables", "Audio"];

export function SubCategoryNav(props: {
  active: ElectronicsSub;
  onChange: (s: ElectronicsSub) => void;
}) {
  const { active, onChange } = props;

  return (
    <div className="w-full border-b bg-slate-50">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2">
        {SUBS.map((s) => {
          const isActive = s === active;
          const isTeaser = s !== "Phones"; // only Phones live for now

          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                if (isTeaser) {
                  alert("Coming soon.");
                  return;
                }
                onChange(s);
              }}
              className={[
                "relative px-1 text-sm transition",
                isActive ? "font-semibold text-slate-900" : "text-slate-500 hover:text-slate-700",
                isTeaser ? "opacity-70" : "",
              ].join(" ")}
              title={isTeaser ? "Coming soon" : undefined}
            >
              {s}
              {isActive && (
                <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-slate-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

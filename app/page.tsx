"use client";

import React, { useMemo, useState } from "react";
import { TopNav, TopCategory } from "@/components/layout/TopNav";
import { SubCategoryNav, ElectronicsSub } from "@/components/layout/SubCategoryNav";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";

// Temporary placeholders (replace with your real components)
function BasicsPanel() {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Basics</div>
      <div className="text-xs text-slate-500">
        OS Dial • Condition Dial • Budget • Screen Size • Primary Use • Longevity • Excluded Brands
      </div>
    </div>
  );
}

function DialsPanel() {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Weights</div>
      <div className="text-xs text-slate-500">
        (All categories collapsed by default; top 5 highlighted; bottom 5 milky.)
      </div>
    </div>
  );
}

function PhonesPanel() {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Top Matches</div>
      <div className="text-xs text-slate-500">
        (Ranked phones list + rotating hero + 2–3 “why this rank” bullets per phone.)
      </div>
    </div>
  );
}

export default function Page() {
  const [topCategory, setTopCategory] = useState<TopCategory>("Electronics");
  const [sub, setSub] = useState<ElectronicsSub>("Phones");

  // If later you add routing, this state can be URL-based.
  const showSubBar = useMemo(() => topCategory === "Electronics", [topCategory]);

  return (
    <div className="min-h-screen bg-slate-100">
      <TopNav active={topCategory} onChange={setTopCategory} />
      {showSubBar && <SubCategoryNav active={sub} onChange={setSub} />}

      <ThreeColumnLayout left={<BasicsPanel />} center={<DialsPanel />} right={<PhonesPanel />} />
    </div>
  );
}

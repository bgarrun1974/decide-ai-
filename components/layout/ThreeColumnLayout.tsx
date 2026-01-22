import React from "react";

export function ThreeColumnLayout(props: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}) {
  const { left, center, right } = props;

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      {/* Mobile: stack */}
      <div className="flex flex-col gap-4 lg:hidden">
        <section className="rounded-xl border bg-white p-3">{left}</section>
        <section className="rounded-xl border bg-white p-3">{center}</section>
        <section className="rounded-xl border bg-white p-3">{right}</section>
      </div>

      {/* Desktop: 24 / 38 / 38 */}
      <div className="hidden gap-4 lg:flex">
        <section className="w-[24%] rounded-xl border bg-white p-3">{left}</section>
        <section className="w-[38%] rounded-xl border bg-white p-3">{center}</section>
        <section className="w-[38%] rounded-xl border bg-white p-3">{right}</section>
      </div>
    </div>
  );
}

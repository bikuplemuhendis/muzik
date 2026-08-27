"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StationPublish({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(published);
  async function toggle() {
    const next = !on;
    setOn(next);
    await fetch(`/api/admin/stations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: next }),
    });
    router.refresh();
  }
  return (
    <button type="button" onClick={() => void toggle()} className="text-sm text-[#c8a45a]">
      {on ? "Yayından al" : "Yayınla"}
    </button>
  );
}

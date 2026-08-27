"use client";

import { PlayerProvider, usePlayer } from "@/components/player/PlayerProvider";
import { useEffect, useState } from "react";

function Screen({
  stationId,
  stationName,
  venueName,
  message,
  accent,
  videos,
}: {
  stationId: string;
  stationName: string;
  venueName: string;
  message: string;
  accent: string;
  videos: { url: string; poster: string; caption: string }[];
}) {
  const { current, playing, startStation, progress, duration } = usePlayer();
  const [i, setI] = useState(0);
  const [clock, setClock] = useState("");
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    void startStation(stationId);
  }, [stationId, startStation, armed]);

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (videos.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % videos.length), 8000);
    return () => clearInterval(t);
  }, [videos.length]);

  const clip = current?.videoUrl
    ? { url: current.videoUrl, poster: current.coverUrl, caption: current.title }
    : videos[i];
  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-black text-white"
      onClick={() => {
        if (!armed) setArmed(true);
      }}
    >
      {clip ? (
        <video
          key={clip.url + (current?.id ?? i)}
          src={clip.url}
          poster={clip.poster}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a140c] to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute left-8 top-8">
        <p className="text-xs uppercase tracking-[0.35em]" style={{ color: accent }}>
          Aura TV
        </p>
        <p className="mt-2 text-lg">{venueName}</p>
      </div>
      <div className="absolute right-8 top-8 text-3xl font-light tabular-nums">{clock}</div>
      <div className="absolute bottom-10 left-8 right-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: accent }}>
          {stationName}
          {playing ? " · canlı" : ""}
        </p>
        <h1 className="mt-2 text-5xl font-bold">{current?.title ?? (armed ? "Yayın bağlanıyor…" : "Ekrana dokunun")}</h1>
        <p className="mt-2 text-xl text-white/80">{current ? `${current.artistName} · ${current.collectionName}` : message}</p>
        <div className="mt-6 h-1 w-full max-w-md rounded-full bg-white/20">
          <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: accent }} />
        </div>
        <p className="mt-4 text-sm text-white/50">{message} · telifsiz ticari icra</p>
      </div>
      {!armed ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/35">
          <p className="rounded-full px-6 py-3 text-lg font-semibold text-black" style={{ background: accent }}>
            Yayını başlat
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function DisplayScreen(props: {
  stationId: string;
  stationName: string;
  venueName: string;
  message: string;
  accent: string;
  videos: { url: string; poster: string; caption: string }[];
}) {
  return (
    <PlayerProvider>
      <Screen {...props} />
    </PlayerProvider>
  );
}

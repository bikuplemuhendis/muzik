import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { formatTry } from "@/lib/pricing";
import { ScheduleForm } from "@/components/player/ScheduleForm";

export default async function VenuePage() {
  const user = await getSessionUser();
  const venue = user?.venue;
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold">İşletmem</h1>
      {!venue ? (
        <p className="text-[#b3b3b3]">Bu hesap bir işletmeye bağlı değil. Admin hesapları katalog yönetir.</p>
      ) : (
        <>
          <p className="text-xl">{venue.name}</p>
          <p className="text-[#b3b3b3]">
            {venue.city} · {venue.venueType} · {venue.locationCount} lokasyon
          </p>
          <div className="my-6 rounded-xl bg-[#181818] p-5">
            <p className="text-sm text-[#c8a45a]">Aktif plan</p>
            <p className="text-2xl font-bold">{venue.plan.name}</p>
            <p className="text-[#b3b3b3]">
              {formatTry(venue.plan.monthlyPriceTry)} / ay · {venue.plan.maxLocations === 999 ? "sınırsız" : venue.plan.maxLocations} lokasyon
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-[#b3b3b3]">
              {(JSON.parse(venue.plan.featuresJson) as string[]).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <ScheduleForm
            venueId={venue.id}
            maxLocations={venue.plan.maxLocations}
            locationCount={venue.locationCount}
            scheduleJson={venue.scheduleJson}
          />
          <Link href="/certificate" className="mt-6 inline-block rounded-full bg-white px-5 py-2 font-semibold text-black">
            Ticari icra belgesi
          </Link>
        </>
      )}
    </div>
  );
}

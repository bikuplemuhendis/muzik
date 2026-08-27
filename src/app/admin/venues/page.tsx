import { prisma } from "@/lib/db";
import { formatTry } from "@/lib/pricing";

export default async function AdminVenuesPage() {
  const venues = await prisma.venue.findMany({ include: { plan: true, users: true } });
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">İşletmeler</h2>
      <div className="space-y-3">
        {venues.map((v) => (
          <div key={v.id} className="rounded-xl bg-[#181818] p-4">
            <p className="font-semibold">{v.name}</p>
            <p className="text-sm text-[#b3b3b3]">
              {v.city} · {v.venueType} · {v.plan.name} · {formatTry(v.plan.monthlyPriceTry)} / ay · {v.users.length} kullanıcı
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

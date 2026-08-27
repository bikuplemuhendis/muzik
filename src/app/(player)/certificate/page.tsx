import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function CertificatePage() {
  const user = await getSessionUser();
  if (!user?.venue) redirect("/venue");
  const license = await prisma.license.findFirst();
  const issued = new Date().toLocaleDateString("tr-TR");
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-[#c8a45a]/40 bg-[#16120a] p-10 print:border-black print:bg-white print:text-black">
      <p className="text-xs uppercase tracking-[0.3em] text-[#c8a45a]">Aura · Ticari icra belgesi</p>
      <h1 className="mt-3 text-3xl font-bold">Mekân müzik belgesi</h1>
      <p className="mt-6 text-[#b3b3b3] print:text-black">
        İşbu belge, <strong>{user.venue.name}</strong> işletmesinin ({user.venue.city}) Aura aboneliği kapsamında, Aura
        kataloğundaki orijinal ve telifsiz eserleri herkese açık mekânda ambiyans / arka plan müziği olarak çalma
        hakkına sahip olduğunu gösterir.
      </p>
      <dl className="mt-6 grid gap-2 text-sm">
        <div>
          <dt className="text-[#6a6a6a]">Plan</dt>
          <dd>{user.venue.plan.name}</dd>
        </div>
        <div>
          <dt className="text-[#6a6a6a]">Lokasyon</dt>
          <dd>
            {user.venue.locationCount} / {user.venue.plan.maxLocations === 999 ? "sınırsız" : user.venue.plan.maxLocations}
          </dd>
        </div>
        <div>
          <dt className="text-[#6a6a6a]">Lisans</dt>
          <dd>{license?.name}</dd>
        </div>
        <div>
          <dt className="text-[#6a6a6a]">Düzenleme</dt>
          <dd>{issued}</dd>
        </div>
      </dl>
      <p className="mt-8 whitespace-pre-wrap text-sm text-[#b3b3b3] print:text-black">{license?.body}</p>
      <p className="mt-8 text-xs text-[#6a6a6a]">
        Bu çıktı bir ürün belgesi şablonudur; hukuki tavsiye veya resmî ruhsat yerine geçmez. Kurumsal sözleşmelerde
        avukat incelemesi gerekir.
      </p>
    </div>
  );
}

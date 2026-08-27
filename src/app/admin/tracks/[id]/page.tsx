import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TrackForm } from "@/components/admin/TrackForm";

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [track, licenses, terms] = await Promise.all([
    prisma.track.findUnique({
      where: { id },
      include: { terms: { include: { term: true } }, media: true },
    }),
    prisma.license.findMany(),
    prisma.taxonomyTerm.findMany(),
  ]);
  if (!track) notFound();
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Parçayı düzenle</h2>
      <TrackForm
        licenses={licenses.map((l) => ({ id: l.id, name: l.name }))}
        terms={terms.map((t) => ({ slug: t.slug, nameTr: t.nameTr, kind: t.kind }))}
        initial={{
          id: track.id,
          title: track.title,
          artistName: track.artistName,
          collectionName: track.collectionName,
          description: track.description,
          durationSec: track.durationSec,
          bpm: track.bpm,
          energy: track.energy,
          audioUrl: track.audioUrl,
          coverUrl: track.coverUrl,
          videoUrl: track.videoUrl,
          isPublished: track.isPublished,
          licenseId: track.licenseId,
          termSlugs: track.terms.map((t) => t.term.slug),
          extraMedia: track.media.map((m) => ({ url: m.url, kind: m.kind, caption: m.caption })),
        }}
      />
    </div>
  );
}

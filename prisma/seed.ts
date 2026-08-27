import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PLAYLISTS, PLANS, TAXONOMY, TRACKS } from "../src/data/catalog";

const prisma = new PrismaClient();

async function main() {
  await prisma.playlistTrack.deleteMany();
  await prisma.trackTerm.deleteMany();
  await prisma.trackMedia.deleteMany();
  await prisma.aiAssistLog.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.track.deleteMany();
  await prisma.taxonomyTerm.deleteMany();
  await prisma.user.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.license.deleteMany();

  for (const plan of PLANS) {
    await prisma.plan.create({
      data: {
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        tagline: plan.tagline,
        monthlyPriceTry: plan.monthlyPriceTry,
        annualPriceTry: plan.annualPriceTry,
        maxLocations: plan.maxLocations,
        maxConcurrentPlayers: plan.maxConcurrentPlayers,
        catalogAccess: plan.catalogAccess,
        highlighted: plan.highlighted,
        sortOrder: plan.sortOrder,
        featuresJson: JSON.stringify(plan.features),
      },
    });
  }

  const license = await prisma.license.create({
    data: {
      id: "lic_aura_commercial",
      slug: "aura-ticari-icra",
      name: "Aura Ticari İcra Lisansı",
      summary:
        "Aura katalogundaki orijinal ve telifsiz eserlerin işletme içinde herkese açık icrasını kapsar. Atıf zorunlu değildir.",
      commercialUse: true,
      publicPerformance: true,
      attributionRequired: false,
      territory: "Türkiye ve dünya",
      body: `Aura Ticari İcra Lisansı

Bu lisans, Aura platformunda yayınlanan orijinal katalog eserlerinin abone işletme tarafından:
- fiziksel mekânda arka plan / ambiyans olarak çalınması,
- işletmenin kendi sosyal medyasında kısa atmosfer görüntüsü ile kullanılması (reklam jingle'ı hariç),
- birden fazla hoparlör / bölgede eşzamanlı çalınması

haklarını, abonelik süresi boyunca ve seçilen planın lokasyon limiti dahilinde verir.

Kapsamaz:
- eserin yeniden satışı veya üçüncü kişilere alt lisans,
- vokal ekleyerek yeni bir şarkı üretmek,
- siyasi reklam, nefret içeriği,
- Spotify / YouTube Music benzeri tüketici yayın hizmetlerinde yeniden yayın.

Toplama kuruluşu denetiminde bu belge + güncel abonelik dökümü ibraz edilir. Bu metin hukuki tavsiye değildir; kurumsal müşteriler için sözleşmeli lisans ile netleştirilir.`,
    },
  });

  const cafe = await prisma.venue.create({
    data: {
      id: "venue_demo_cafe",
      name: "Demo Kafe Kadıköy",
      venueType: "cafe",
      city: "İstanbul",
      address: "Moda Caddesi 12, Kadıköy",
      planId: "plan_cafe",
      locationCount: 1,
      scheduleJson: JSON.stringify({
        morning: "pl_kahve_saati",
        afternoon: "pl_brunch",
        evening: "pl_aksam_servisi",
        night: "pl_lounge_after_dark",
      }),
    },
  });

  await prisma.venue.create({
    data: {
      id: "venue_demo_hotel",
      name: "Demo Hotel Galata",
      venueType: "hotel",
      city: "İstanbul",
      address: "Bereketzade, Galata",
      planId: "plan_restoran",
      locationCount: 2,
      scheduleJson: JSON.stringify({
        morning: "pl_lobi_sukuneti",
        afternoon: "pl_lobi_sukuneti",
        evening: "pl_aksam_servisi",
        night: "pl_lounge_after_dark",
      }),
    },
  });

  const adminHash = await bcrypt.hash("AuraAdmin123!", 10);
  const venueHash = await bcrypt.hash("AuraVenue123!", 10);

  const admin = await prisma.user.create({
    data: {
      id: "user_admin",
      email: "admin@aura.local",
      passwordHash: adminHash,
      name: "Aura Katalog",
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      id: "user_venue",
      email: "venue@aura.local",
      passwordHash: venueHash,
      name: "Selin Demir",
      role: "VENUE",
      venueId: cafe.id,
    },
  });

  for (const term of TAXONOMY) {
    await prisma.taxonomyTerm.create({ data: term });
  }

  const termBySlug = Object.fromEntries((await prisma.taxonomyTerm.findMany()).map((t) => [t.slug, t]));

  for (const track of TRACKS) {
    await prisma.track.create({
      data: {
        id: track.id,
        title: track.title,
        artistName: track.artistName,
        collectionName: track.collectionName,
        description: track.description,
        durationSec: track.durationSec,
        bpm: track.bpm,
        energy: track.energy,
        audioUrl: `/media/audio/${track.slug}.mp3`,
        coverUrl: `/media/covers/${track.slug}.png`,
        videoUrl: track.video ? `/media/video/${track.slug}.mp4` : null,
        isPublished: true,
        licenseId: license.id,
        createdById: admin.id,
        terms: {
          create: track.termSlugs
            .map((slug) => termBySlug[slug])
            .filter(Boolean)
            .map((term) => ({ termId: term.id })),
        },
        media: {
          create: Array.from({ length: track.extraPhotos }, (_, i) => ({
            kind: "photo",
            url: `/media/photos/${track.slug}-${i + 1}.png`,
            caption: `${track.title} mekân referansı ${i + 1}`,
            sortOrder: i,
          })),
        },
      },
    });
  }

  for (const pl of PLAYLISTS) {
    await prisma.playlist.create({
      data: {
        id: pl.id,
        title: pl.title,
        description: pl.description,
        coverUrl: `/media/playlists/${pl.id}.png`,
        kind: "CURATED",
        venueFit: pl.venueFit,
        isPublic: true,
        createdById: admin.id,
        tracks: {
          create: pl.trackIds.map((trackId, position) => ({ trackId, position })),
        },
      },
    });
  }

  console.log(`Seeded ${TRACKS.length} tracks, ${PLAYLISTS.length} playlists, demo admin + venue.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

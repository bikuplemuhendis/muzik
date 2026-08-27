# Aura — ürün, iş ve teknik plan

Telifsiz, işletme odaklı bir ambiyans müzik platformu. Tüketici dinleme uygulaması (Spotify, Apple Music, YouTube Music) **mekânda çalmak için lisans vermez**. Aura’nın işi tam olarak bu boşluğu doldurmak: orijinal katalog, ticari icra hakkı, Spotify benzeri çalar ve yalnızca admin’in doldurduğu kütüphane.

Bu belge hukuki tavsiye değildir. Türkiye’de MESAM / MSG / MÜYAP ve mekân denetimi pratikleri avukat ve meslek birliği tarifeleriyle netleştirilmelidir.

## 1. Problem

- Kafeler, restoranlar, oteller, spa ve mağazalar arka plan müziği çalar.
- Tüketici aboneliği kamuoyuna açık icrayı kapsamaz; denetimde ceza / tarife riski doğar.
- Hazır “telifsiz” stok siteleri genelde indirme + belirsiz lisans verir; çalar, gün dilimi programı ve işletme belgesi yoktur.
- Playlist’ler vokal, drop ve telifli hit’lerle doludur; konuşmayı ezer.

## 2. Çözüm

Aura üç katman sunar:

1. **Katalog** — Aura’ya ait veya tam devir alınmış, sözsüz, mekân için yazılmış eserler.
2. **Lisans** — Abonelik süresince ve lokasyon limiti içinde ticari icra. Atıf zorunlu değil.
3. **Ürün** — Spotify benzeri işletme çaları + admin katalog (ses, kapak, video, AI etiket).

İşletme **müzik yüklemez**. Yalnızca çalar, programlar ve belge indirir.

## 3. Yasal / telif modeli

Hedef: “Bu şarkının hakkı Aura’dadır; mekân Aura abonesidir.”

| Kaynak | Kullan | Kullanma |
| --- | --- | --- |
| In-house besteci (iş-for-hire) | Varsayılan | — |
| Brief’li freelancer, tam devir sözleşmesi | Evet | Telif paylaşımlı / belirsiz |
| Stok site “royalty-free” | Yalnızca lisans kamu icrasını **açıkça** kapsıyorsa | “Editorial only”, YouTube Content ID belirsiz |
| Hit / cover / radyo | Asla | Asla |
| Generative model çıktısı | Yalnızca model ve çıktı hakları sözleşmeyle Aura’da kalıyorsa | Eğitim verisi belirsiz modeller |

Operasyon kuralları:

- Her parça admin’de lisans kaydına bağlanır.
- Vokal yok (söz = ayrı kompozisyon + icra karmaşası).
- Mekân belgesi: işletme adı, plan, lokasyon sayısı, lisans özeti, tarih.
- Sosyal medya: kısa atmosfer klibi (abonelik kapsamında, reklam jingle’ı değil).
- Yeniden satış, alt lisans, tüketici streaming’e yükleme yasak.

Denetim cümlesi (satış, abartısız): “Çaldığımız katalog Aura’nın orijinal eserleridir; tüketici uygulaması kullanmıyoruz.”

## 4. Kütüphane taksonomisi

Her parça şu eksenlerde etiketlenir:

- **Mekân:** kafe, restoran, otel lobi, spa, mağaza, spor, ofis, lounge/bar
- **Ruh hali:** sakin, sıcak, zarif, odak, canlı, samimi, ferah
- **Tür:** ambiyans, akustik, piyano, lo-fi, lounge caz, yumuşak elektronik, neoklasik
- **Gün dilimi:** sabah, öğleden sonra, akşam, gece
- **Enerji:** 1–5 (spa 1, spor 4–5)
- **Etiket:** telifsiz, enstrümantal, döngüye uygun, sohbete uygun

Koleksiyonlar (albüm benzeri) + küratör listeleri (Kahve Saati, Akşam Servisi, Lobi Sükuneti…).

Medya: ses (zorunlu), kapak, opsiyonel döngü video, mekân referans fotoğrafları.

## 5. Fiyatlandırma (işletme, TRY)

Rakip algısı: meslek birliği mekân tarifeleri + stok indirme siteleri. Aura **tahmin edilebilir aylık** satar.

| Plan | Aylık | Yıllık | Lokasyon / çalar | Kimin için |
| --- | --- | --- | --- | --- |
| Kafe | ₺1.490 | ₺14.900 | 1 / 2 | Tek şube kafe, ofis, butik |
| Restoran & Otel | ₺3.990 | ₺39.900 | 3 / 8 | Restoran, butik otel, spa |
| Zincir | ₺9.900 | ₺99.000 | sınırsız / 50 | Çok şube, merkezî liste |

Yıllık ~%17 indirim. Pilot dönemde 30 gün deneme.

Kapsam dışı (ayrı teklif): TV/reklam jingle, marka anthem, üçüncü taraf yayın.

## 6. Ürün yüzeyleri

### İşletme çaları (Spotify benzeri)

- Sol menü, ana sayfa önerileri, arama, kitaplık, alt çalar
- Kapak + now playing; varsa video arka plan
- Mekân türü / ruh hali browse
- Gün dilimi programı
- Ticari icra belgesi

### Admin (tek katalog kapısı)

- Parça ekle/düzenle: ses, kapak, video, ek fotoğraf
- Aura Intelligence: dosya adı + not → başlık, açıklama, BPM, enerji, etiket
- Listeler, taksonomi, lisans metni, abone işletmeler

`OPENAI_API_KEY` varsa bulut modeli; yoksa yerel kural motoru.

## 7. Teknik mimari (bu repo)

- Next.js App Router, TypeScript, Tailwind
- Prisma + SQLite (üretimde Postgres’e taşınır)
- HMAC oturum çerezi (ADMIN / VENUE)
- Yerel `public/media` + admin upload
- Seed: sentetik, orijinal demo tonları (üretim kataloğu değildir)

Üretim hedefi: S3/R2, Postgres, gerçek CDN, donanım çalar (Raspberry / existing amp).

## 8. Go-to-market

1. 10–20 kafe/restoran pilot (Kadıköy, Galata, Çeşme sezon).
2. Otel lobi + spa (yüksek tarife hassasiyeti).
3. Zincir: tek marka listesi, şube bazlı çalar.
4. Satış argümanı: “denetimde belge + sözsüz katalog + sabit fatura.”

KPI: çalma saati / lokasyon, churn, “belge indirildi”, özel liste talebi.

## 9. Yol haritası

- Donanım / kiosk çalar, çevrimdışı önbellek
- Merkezî şube yönetimi
- Besteci portalı (sözleşme + teslim, yine admin onayı)
- MESAM vb. ile “orijinal katalog mekân kullanımı” net yazışma
- Analitik: hangi enerji hangi saatte dönüşüyor

## 10. Bu prototipte kasıtlı sınırlar

- Seed sesler ffmpeg ile üretilmiş **orijinal demo tonlarıdır**; yayın kataloğu yerine geçmez.
- Ödeme (iyzico/Stripe) yok; planlar veri modelinde.
- Hukuki metin şablondur.

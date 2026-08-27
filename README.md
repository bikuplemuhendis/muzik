# Aura

İşletmeler için telifsiz ambiyans müziği. Spotify benzeri çalar, yalnızca admin’in doldurduğu katalog, kapak/video medyası ve Aura Intelligence etiketleme.

Ürün / lisans / fiyat planı: [docs/PLAN.md](docs/PLAN.md)

## Çalıştırma

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Aç: [http://localhost:3000](http://localhost:3000)

`setup` ffmpeg ile demo medya üretir ve SQLite’ı doldurur.

### Demo hesaplar

| Rol | E-posta | Şifre |
| --- | --- | --- |
| İşletme | venue@aura.local | AuraVenue123! |
| Admin | admin@aura.local | AuraAdmin123! |

## Ne var?

- Pazarlama sayfası ve işletme planları (Kafe / Restoran & Otel / Zincir)
- İşletme çaları: ana sayfa, arama, kitaplık, katalog, liste, parça (video + fotoğraf), gün dilimi, icra belgesi
- Admin: parça ekleme (ses, kapak, video, ek görsel), AI öneri, listeler, taksonomi, lisanslar, aboneler
- Yerel AI (kural) + isteğe bağlı `OPENAI_API_KEY`

Seed sesler **sentetik demo tonlarıdır**; üretimde in-house / tam devir katalog gerekir.

## Test

```bash
npm test
npm run lint
npm run build
```

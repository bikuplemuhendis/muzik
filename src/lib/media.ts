import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "media", "uploads");

const ALLOWED: Record<string, string[]> = {
  audio: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/ogg", "audio/webm"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

function extFor(mime: string, originalName: string) {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName) return fromName;
  if (mime.includes("mpeg")) return ".mp3";
  if (mime.includes("wav")) return ".wav";
  if (mime.includes("png")) return ".png";
  if (mime.includes("jpeg")) return ".jpg";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("mp4")) return ".mp4";
  if (mime.includes("webm")) return ".webm";
  return "";
}

export function classifyMime(mime: string): "audio" | "image" | "video" | null {
  if (ALLOWED.audio.includes(mime)) return "audio";
  if (ALLOWED.image.includes(mime)) return "image";
  if (ALLOWED.video.includes(mime)) return "video";
  return null;
}

export async function saveUpload(file: File, kindHint?: "audio" | "image" | "video") {
  const mime = file.type || "application/octet-stream";
  const kind = kindHint ?? classifyMime(mime);
  if (!kind) {
    throw new Error(`Desteklenmeyen dosya türü: ${mime || file.name}`);
  }
  if (file.size > 32 * 1024 * 1024) {
    throw new Error("Dosya 32 MB sınırını aşıyor.");
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const id = randomBytes(8).toString("hex");
  const ext = extFor(mime, file.name);
  const filename = `${kind}-${id}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buf);
  return { url: `/media/uploads/${filename}`, kind, mime, size: file.size, filename };
}

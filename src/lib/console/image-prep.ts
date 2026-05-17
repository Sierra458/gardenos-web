import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/heic", "image/webp"]);

export function isAllowedImageMime(mime: string | undefined): boolean {
  if (!mime) return false;
  return ALLOWED_MIMES.has(mime);
}

export async function detectMimeType(bytes: Buffer | Uint8Array): Promise<string | undefined> {
  const result = await fileTypeFromBuffer(bytes);
  return result?.mime;
}

export interface ResizedImage {
  bytes: Buffer;
  mime: "image/jpeg";
  width: number;
  height: number;
}

/**
 * Resize an image to ≤1600px wide, output as mozjpeg quality 80.
 * Used on upload (D11) and pre-commit. EXIF orientation is honored.
 */
export async function resizeForBlob(input: Buffer | Uint8Array): Promise<ResizedImage> {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const pipeline = sharp(buf, { failOn: "none" })
    .rotate() // honor EXIF orientation
    .resize({ width: 1600, withoutEnlargement: true, fit: "inside" })
    .jpeg({ quality: 80, mozjpeg: true });
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { bytes: data, mime: "image/jpeg", width: info.width, height: info.height };
}

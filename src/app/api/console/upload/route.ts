import { NextRequest, NextResponse } from "next/server";
import { uploadBlob } from "@/lib/console/blob";
import { detectMimeType, isAllowedImageMime, resizeForBlob } from "@/lib/console/image-prep";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB raw

function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin requests have no Origin header
  try {
    const o = new URL(origin);
    const host = req.headers.get("host");
    return host !== null && o.host === host;
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  if (!originAllowed(req)) return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart form" }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 413 });

  const ab = await file.arrayBuffer();
  const bytes = Buffer.from(ab);

  // Sniff actual MIME from magic bytes — don't trust the Content-Type header.
  const sniffed = await detectMimeType(bytes);
  if (!isAllowedImageMime(sniffed)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const name = (file instanceof File && file.name) ? file.name : "upload.jpg";
  const resized = await resizeForBlob(bytes); // always JPEG after this
  const result = await uploadBlob(resized.bytes, name, resized.mime);
  return NextResponse.json({ url: result.url, pathname: result.pathname, width: resized.width, height: resized.height });
}

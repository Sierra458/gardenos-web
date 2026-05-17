import { put, del } from "@vercel/blob";
import { randomBytes } from "node:crypto";

const PREFIX = "console-uploads";

export interface UploadedBlob {
  url: string;
  pathname: string;
}

export async function uploadBlob(bytes: Buffer | Uint8Array, originalName: string, mime: string): Promise<UploadedBlob> {
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "bin";
  const id = randomBytes(8).toString("hex");
  const pathname = `${PREFIX}/${new Date().toISOString().slice(0, 10)}/${id}.${ext}`;
  const result = await put(pathname, bytes, {
    access: "public",         // signed URL access is "public" in @vercel/blob v2+; the random pathname is the secret
    contentType: mime,
    addRandomSuffix: false,    // we already added random
  });
  return { url: result.url, pathname: result.pathname };
}

export async function deleteBlob(pathname: string): Promise<void> {
  await del(pathname);
}

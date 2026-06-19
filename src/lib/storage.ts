import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client for server-side storage operations. Bypasses RLS, so it
// must only ever be imported in server code (enforced by "server-only").
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const REGISTRATION_BUCKET = "registration-files";

let cached: ReturnType<typeof createClient> | null = null;

function client() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Supabase storage is not configured (missing URL or service role key).",
    );
  }
  cached ??= createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  return cached;
}

let bucketReady = false;

// Lazily ensure the private bucket exists. Safe to call on every upload.
async function ensureBucket() {
  if (bucketReady) return;
  const sb = client();
  const { data } = await sb.storage.getBucket(REGISTRATION_BUCKET);
  if (!data) {
    await sb.storage.createBucket(REGISTRATION_BUCKET, {
      public: false,
      fileSizeLimit: 15 * 1024 * 1024, // 15 MB
    });
  }
  bucketReady = true;
}

export type StoredFile = { path: string; fileName: string };

export async function uploadRegistrationFile(
  folder: string,
  file: File,
): Promise<StoredFile> {
  await ensureBucket();
  const sb = client();

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${folder}/${crypto.randomUUID()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await sb.storage
    .from(REGISTRATION_BUCKET)
    .upload(unique, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  return { path: unique, fileName: file.name };
}

// Create a short-lived signed URL so authorized users can download a file.
export async function signedUrl(
  path: string,
  expiresInSeconds = 60 * 10,
): Promise<string | null> {
  const sb = client();
  const { data, error } = await sb.storage
    .from(REGISTRATION_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}

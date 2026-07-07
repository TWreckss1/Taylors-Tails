import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { optimizeImage } from "./imageOptimize";

export async function uploadFile(file: File, folder: string): Promise<string> {
  if (!storage) throw new Error("Firebase Storage not configured");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/** Resizes/compresses an image client-side before uploading — keeps gallery
 * photos looking good without eating into the Firebase Storage free tier.
 * Falls back to uploading the original file if optimization fails for any
 * reason (e.g. an unsupported format), so an upload never hard-fails. */
export async function uploadOptimizedImage(file: File, folder: string): Promise<string> {
  if (!storage) throw new Error("Firebase Storage not configured");

  let blob: Blob = file;
  let extension = "jpg";
  try {
    blob = await optimizeImage(file);
  } catch (err) {
    console.error("Image optimization failed, uploading original:", err);
    extension = file.name.split(".").pop() || "jpg";
  }

  const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const path = `${folder}/${Date.now()}-${baseName}.${extension}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: blob.type || "image/jpeg" });
  return getDownloadURL(storageRef);
}

/**
 * Resizes and compresses an image entirely in the browser before upload —
 * keeps gallery photos looking sharp while using a fraction of the storage
 * a raw phone photo (often 5-10MB) would otherwise take.
 */
export async function optimizeImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      quality
    );
  });
}

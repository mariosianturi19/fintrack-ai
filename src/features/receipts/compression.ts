import {
  RECEIPT_MAX_DIMENSION,
  RECEIPT_MAX_UPLOAD_BYTES,
  RECEIPT_UPLOAD_TYPE,
} from "./constants";
import { validateReceiptSource } from "./validation";

export class ReceiptCompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReceiptCompressionError";
  }
}

export type ReceiptCompressionResult = Readonly<{
  blob: Blob;
  height: number;
  originalBytes: number;
  width: number;
}>;

export function fitWithinDimensions(
  width: number,
  height: number,
  maximumDimension: number,
): Readonly<{ height: number; width: number }> {
  if (width <= 0 || height <= 0 || maximumDimension <= 0) {
    throw new Error("Image dimensions must be positive.");
  }

  const scale = Math.min(1, maximumDimension / Math.max(width, height));

  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new ReceiptCompressionError("Foto tidak dapat dikompresi."));
      },
      RECEIPT_UPLOAD_TYPE,
      quality,
    );
  });
}

export async function compressReceiptImage(
  file: File,
): Promise<ReceiptCompressionResult> {
  const validation = validateReceiptSource(file);

  if (!validation.valid) {
    throw new ReceiptCompressionError(validation.message);
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ReceiptCompressionError(
      "Foto tidak dapat dibaca. Pilih foto struk lain.",
    );
  }

  const dimensionPasses = [2_200, 1_900, 1_600, 1_400, 1_200];
  const qualityPasses = [0.88, 0.8, 0.72, 0.64, 0.56, 0.46];

  try {
    for (const maximumDimension of dimensionPasses) {
      const dimensions = fitWithinDimensions(
        bitmap.width,
        bitmap.height,
        Math.min(maximumDimension, RECEIPT_MAX_DIMENSION),
      );
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      const context = canvas.getContext("2d", { alpha: false });

      if (!context) {
        throw new ReceiptCompressionError("Foto tidak dapat diproses.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of qualityPasses) {
        const blob = await canvasToBlob(canvas, quality);

        if (blob.size <= RECEIPT_MAX_UPLOAD_BYTES) {
          return {
            blob,
            height: dimensions.height,
            originalBytes: file.size,
            width: dimensions.width,
          };
        }
      }
    }
  } finally {
    bitmap.close();
  }

  throw new ReceiptCompressionError(
    "Foto masih terlalu besar setelah dikompresi. Coba ambil foto lebih dekat.",
  );
}

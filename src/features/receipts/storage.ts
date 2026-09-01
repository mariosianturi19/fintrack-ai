import "server-only";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { environment } from "@/lib/env/server";
import { reserveAccountStorage } from "@/features/account-deletion/storage-activity";

import {
  RECEIPT_MAX_UPLOAD_BYTES,
  RECEIPT_PREVIEW_URL_TTL_SECONDS,
  RECEIPT_UPLOAD_TYPE,
  RECEIPT_UPLOAD_URL_TTL_SECONDS,
} from "./constants";
import type { ReceiptUploadConfirmation, ReceiptUploadTicket } from "./domain";
import {
  createPendingReceiptObjectKey,
  createReceiptObjectKey,
  isOwnedReceiptObjectKey,
} from "./object-key";

type ReceiptStorageErrorCode =
  "configuration" | "invalid_object" | "not_found" | "unavailable";

export class ReceiptStorageError extends Error {
  constructor(
    public readonly code: ReceiptStorageErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ReceiptStorageError";
  }
}

type R2Configuration = Readonly<{
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  secretAccessKey: string;
}>;

let r2Client: S3Client | undefined;

function getR2Configuration(): R2Configuration {
  const {
    R2_ACCESS_KEY_ID,
    R2_BUCKET_NAME,
    R2_ENDPOINT,
    R2_SECRET_ACCESS_KEY,
  } = environment;

  if (
    !R2_ACCESS_KEY_ID ||
    !R2_BUCKET_NAME ||
    !R2_ENDPOINT ||
    !R2_SECRET_ACCESS_KEY
  ) {
    throw new ReceiptStorageError(
      "configuration",
      "Penyimpanan foto belum dikonfigurasi.",
    );
  }

  return {
    accessKeyId: R2_ACCESS_KEY_ID,
    bucket: R2_BUCKET_NAME,
    endpoint: R2_ENDPOINT,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  };
}

function getR2Client(configuration: R2Configuration): S3Client {
  r2Client ??= new S3Client({
    credentials: {
      accessKeyId: configuration.accessKeyId,
      secretAccessKey: configuration.secretAccessKey,
    },
    endpoint: configuration.endpoint,
    region: "auto",
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return r2Client;
}

export function getReceiptStorageClient() {
  const configuration = getR2Configuration();
  return { bucket: configuration.bucket, client: getR2Client(configuration) };
}

function expiryFromNow(seconds: number): string {
  return new Date(Date.now() + seconds * 1_000).toISOString();
}

async function removeObject(bucket: string, key: string, client: S3Client) {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

function getStorageStatusCode(error: unknown): number | undefined {
  return (error as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode;
}

export async function createReceiptUploadTicket(
  userId: string,
  uploadId: string,
  sizeBytes: number,
): Promise<ReceiptUploadTicket> {
  const configuration = getR2Configuration();
  const client = getR2Client(configuration);
  const key = createPendingReceiptObjectKey(userId, uploadId);

  try {
    const signingDate = await reserveAccountStorage(userId, "upload");
    if (
      Date.now() >=
      signingDate.getTime() + RECEIPT_UPLOAD_URL_TTL_SECONDS * 1000
    ) {
      throw new Error("Upload reservation expired.");
    }
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: configuration.bucket,
        CacheControl: "private, no-store, max-age=0",
        ContentLength: sizeBytes,
        ContentType: RECEIPT_UPLOAD_TYPE,
        Key: key,
      }),
      { expiresIn: RECEIPT_UPLOAD_URL_TTL_SECONDS, signingDate },
    );

    return {
      expiresAt: new Date(
        signingDate.getTime() + RECEIPT_UPLOAD_URL_TTL_SECONDS * 1000,
      ).toISOString(),
      uploadId,
      uploadUrl,
    };
  } catch (error) {
    console.error("[Fintrack AI] Gagal membuat tiket upload R2.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    throw new ReceiptStorageError(
      "unavailable",
      "Tiket upload belum dapat dibuat.",
    );
  }
}

export async function confirmReceiptUpload(
  userId: string,
  uploadId: string,
): Promise<ReceiptUploadConfirmation> {
  const configuration = getR2Configuration();
  const client = getR2Client(configuration);
  const key = createPendingReceiptObjectKey(userId, uploadId);

  try {
    const metadata = await client.send(
      new HeadObjectCommand({ Bucket: configuration.bucket, Key: key }),
    );
    const sizeBytes = metadata.ContentLength ?? 0;

    if (
      sizeBytes < 1 ||
      sizeBytes > RECEIPT_MAX_UPLOAD_BYTES ||
      metadata.ContentType !== RECEIPT_UPLOAD_TYPE
    ) {
      await removeObject(configuration.bucket, key, client);
      throw new ReceiptStorageError(
        "invalid_object",
        "Foto upload tidak memenuhi batas keamanan.",
      );
    }

    const signatureResponse = await client.send(
      new GetObjectCommand({
        Bucket: configuration.bucket,
        Key: key,
        Range: "bytes=0-2",
      }),
    );
    const signature = await signatureResponse.Body?.transformToByteArray();
    const isJpeg =
      signature?.length === 3 &&
      signature[0] === 0xff &&
      signature[1] === 0xd8 &&
      signature[2] === 0xff;

    if (!isJpeg) {
      await removeObject(configuration.bucket, key, client);
      throw new ReceiptStorageError(
        "invalid_object",
        "Isi foto upload tidak valid.",
      );
    }

    const previewUrl = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: configuration.bucket,
        Key: key,
        ResponseCacheControl: "private, no-store, max-age=0",
        ResponseContentType: RECEIPT_UPLOAD_TYPE,
      }),
      { expiresIn: RECEIPT_PREVIEW_URL_TTL_SECONDS },
    );

    return {
      expiresAt: expiryFromNow(RECEIPT_PREVIEW_URL_TTL_SECONDS),
      previewUrl,
      sizeBytes,
      uploadId,
    };
  } catch (error) {
    if (error instanceof ReceiptStorageError) {
      throw error;
    }

    const statusCode = getStorageStatusCode(error);

    if (statusCode === 404) {
      throw new ReceiptStorageError(
        "not_found",
        "Foto upload tidak ditemukan atau tiket sudah kedaluwarsa.",
      );
    }

    console.error("[Fintrack AI] Verifikasi upload R2 gagal.", error);
    throw new ReceiptStorageError(
      "unavailable",
      "Foto belum dapat diverifikasi.",
    );
  }
}

export async function readPendingReceiptImage(
  userId: string,
  uploadId: string,
): Promise<Uint8Array> {
  const configuration = getR2Configuration();
  const client = getR2Client(configuration);
  const key = createPendingReceiptObjectKey(userId, uploadId);

  try {
    const response = await client.send(
      new GetObjectCommand({ Bucket: configuration.bucket, Key: key }),
    );
    const bytes = await response.Body?.transformToByteArray();

    if (
      !bytes ||
      bytes.length < 3 ||
      bytes.length > RECEIPT_MAX_UPLOAD_BYTES ||
      bytes[0] !== 0xff ||
      bytes[1] !== 0xd8 ||
      bytes[2] !== 0xff
    ) {
      throw new ReceiptStorageError(
        "invalid_object",
        "Foto upload tidak memenuhi batas keamanan.",
      );
    }

    return bytes;
  } catch (error) {
    if (error instanceof ReceiptStorageError) {
      throw error;
    }

    if (getStorageStatusCode(error) === 404) {
      throw new ReceiptStorageError(
        "not_found",
        "Foto sementara tidak ditemukan. Upload ulang foto struk.",
      );
    }

    console.error("[Fintrack AI] Foto R2 belum dapat dibaca.", {
      statusCode: getStorageStatusCode(error),
    });
    throw new ReceiptStorageError(
      "unavailable",
      "Foto belum dapat dibaca dari penyimpanan privat.",
    );
  }
}

export async function promotePendingReceiptUpload(
  userId: string,
  uploadId: string,
): Promise<string> {
  const configuration = getR2Configuration();
  const client = getR2Client(configuration);
  const sourceKey = createPendingReceiptObjectKey(userId, uploadId);
  const destinationKey = createReceiptObjectKey(userId, uploadId);
  const copySource = `${configuration.bucket}/${sourceKey}`
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  try {
    const reservedAt = await reserveAccountStorage(userId, "copy");
    if (Date.now() >= reservedAt.getTime() + 30_000)
      throw new Error("Copy reservation expired.");
    const copySignal = AbortSignal.timeout(30_000);
    await client.send(
      new CopyObjectCommand({
        Bucket: configuration.bucket,
        CacheControl: "private, no-store, max-age=0",
        ContentType: RECEIPT_UPLOAD_TYPE,
        CopySource: copySource,
        Key: destinationKey,
        MetadataDirective: "REPLACE",
      }),
      { abortSignal: copySignal },
    );
    const metadata = await client.send(
      new HeadObjectCommand({
        Bucket: configuration.bucket,
        Key: destinationKey,
      }),
      { abortSignal: copySignal },
    );

    if (
      !metadata.ContentLength ||
      metadata.ContentLength > RECEIPT_MAX_UPLOAD_BYTES ||
      metadata.ContentType !== RECEIPT_UPLOAD_TYPE
    ) {
      await removeObject(configuration.bucket, destinationKey, client);
      throw new ReceiptStorageError(
        "invalid_object",
        "Foto permanen gagal diverifikasi.",
      );
    }

    return destinationKey;
  } catch (error) {
    if (error instanceof ReceiptStorageError) {
      throw error;
    }

    console.error("[Fintrack AI] Promosi foto R2 gagal.", {
      statusCode: getStorageStatusCode(error),
    });
    throw new ReceiptStorageError(
      "unavailable",
      "Foto belum dapat diamankan sebagai bagian transaksi.",
    );
  }
}

export async function createStoredReceiptPreviewUrl(
  userId: string,
  objectKey: string,
): Promise<string> {
  if (!isOwnedReceiptObjectKey(userId, objectKey)) {
    throw new ReceiptStorageError(
      "invalid_object",
      "Identitas foto struk tidak valid.",
    );
  }

  const configuration = getR2Configuration();
  const client = getR2Client(configuration);

  try {
    return await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: configuration.bucket,
        Key: objectKey,
        ResponseCacheControl: "private, no-store, max-age=0",
        ResponseContentType: RECEIPT_UPLOAD_TYPE,
      }),
      { expiresIn: RECEIPT_PREVIEW_URL_TTL_SECONDS },
    );
  } catch (error) {
    console.error("[Fintrack AI] Preview struk R2 gagal dibuat.", {
      statusCode: getStorageStatusCode(error),
    });
    throw new ReceiptStorageError(
      "unavailable",
      "Preview foto struk belum tersedia.",
    );
  }
}

export async function deleteStoredReceiptObject(
  userId: string,
  objectKey: string,
): Promise<void> {
  if (!isOwnedReceiptObjectKey(userId, objectKey)) {
    throw new ReceiptStorageError(
      "invalid_object",
      "Identitas foto struk tidak valid.",
    );
  }

  const configuration = getR2Configuration();
  const client = getR2Client(configuration);

  try {
    await removeObject(configuration.bucket, objectKey, client);
  } catch (error) {
    console.error("[Fintrack AI] Penghapusan foto struk R2 gagal.", {
      statusCode: getStorageStatusCode(error),
    });
    throw new ReceiptStorageError(
      "unavailable",
      "Foto struk belum dapat dihapus. Coba lagi.",
    );
  }
}

export async function deletePendingReceiptUpload(
  userId: string,
  uploadId: string,
): Promise<void> {
  const configuration = getR2Configuration();
  const client = getR2Client(configuration);
  const key = createPendingReceiptObjectKey(userId, uploadId);

  try {
    await removeObject(configuration.bucket, key, client);
  } catch (error) {
    console.error("[Fintrack AI] Cleanup upload R2 gagal.", error);
    throw new ReceiptStorageError(
      "unavailable",
      "Foto sementara belum dapat dihapus.",
    );
  }
}

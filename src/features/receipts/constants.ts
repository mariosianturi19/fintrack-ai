export const RECEIPT_SOURCE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const RECEIPT_UPLOAD_TYPE = "image/jpeg" as const;
export const RECEIPT_MAX_SOURCE_BYTES = 15_000_000;
export const RECEIPT_MAX_UPLOAD_BYTES = 500_000;
export const RECEIPT_MAX_DIMENSION = 2_200;
export const RECEIPT_UPLOAD_URL_TTL_SECONDS = 120;
export const RECEIPT_PREVIEW_URL_TTL_SECONDS = 300;
export const RECEIPT_ANALYSIS_TIMEOUT_MS = 30_000;
export const RECEIPT_AI_REQUESTS_PER_MINUTE = 4;
export const RECEIPT_AI_REQUESTS_PER_DAY = 20;
export const RECEIPT_MAX_ITEMS = 100;

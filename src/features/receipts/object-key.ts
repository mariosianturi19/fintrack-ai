const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createPendingReceiptObjectKey(
  userId: string,
  uploadId: string,
): string {
  if (!uuidPattern.test(userId) || !uuidPattern.test(uploadId)) {
    throw new Error("Receipt owner and upload identifiers must be UUIDs.");
  }

  return `receipts/pending/${userId}/${uploadId}.jpg`;
}

export function createReceiptObjectKey(
  userId: string,
  uploadId: string,
): string {
  if (!uuidPattern.test(userId) || !uuidPattern.test(uploadId)) {
    throw new Error("Receipt owner and upload identifiers must be UUIDs.");
  }

  return `receipts/${userId}/${uploadId}.jpg`;
}

export function isOwnedReceiptObjectKey(
  userId: string,
  objectKey: string,
): boolean {
  if (!uuidPattern.test(userId)) {
    return false;
  }

  const match = objectKey.match(
    /^receipts\/([0-9a-f-]{36})\/([0-9a-f-]{36})\.jpg$/i,
  );

  return Boolean(
    match &&
    match[1].toLowerCase() === userId.toLowerCase() &&
    uuidPattern.test(match[2]),
  );
}

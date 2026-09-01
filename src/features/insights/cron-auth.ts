import { timingSafeEqual } from "node:crypto";

export function isAuthorizedCronRequest(
  request: Request,
  cronSecret: string | undefined,
) {
  if (!cronSecret) {
    return false;
  }

  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${cronSecret}`);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

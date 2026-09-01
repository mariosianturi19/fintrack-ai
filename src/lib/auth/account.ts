export type AccountSummary = Readonly<{
  displayName: string;
  email: string;
  initials: string;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "FT";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export function createAccountSummary(claims: unknown): AccountSummary {
  const payload = isRecord(claims) ? claims : {};
  const metadata = isRecord(payload.user_metadata) ? payload.user_metadata : {};
  const email =
    typeof payload.email === "string" ? payload.email : "Akun Google";
  const metadataName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : undefined;
  const displayName = metadataName?.trim() || email.split("@")[0] || "Pengguna";

  return {
    displayName,
    email,
    initials: getInitials(displayName),
  };
}

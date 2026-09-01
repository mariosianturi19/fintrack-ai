const internalOrigin = "https://fintrack.invalid";

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/",
) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const candidate = new URL(value, internalOrigin);

    if (candidate.origin !== internalOrigin) {
      return fallback;
    }

    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return fallback;
  }
}

export function createLoginPath({
  error,
  message,
  next,
}: {
  error?: string;
  message?: string;
  next?: string;
}) {
  const searchParams = new URLSearchParams();

  if (error) {
    searchParams.set("error", error);
  }

  if (message) {
    searchParams.set("message", message);
  }

  if (next && next !== "/") {
    searchParams.set("next", getSafeRedirectPath(next));
  }

  const query = searchParams.toString();

  return query ? `/login?${query}` : "/login";
}

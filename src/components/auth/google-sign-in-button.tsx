"use client";

import { useFormStatus } from "react-dom";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">
      <path
        d="M21.35 12.22c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.5h3.15c1.84-1.7 2.9-4.2 2.9-7.26Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.75c2.63 0 4.83-.87 6.44-2.36l-3.15-2.5c-.87.59-1.99.94-3.29.94-2.53 0-4.68-1.71-5.45-4.01H3.3v2.58A9.74 9.74 0 0 0 12 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.55 13.82A5.86 5.86 0 0 1 6.25 12c0-.63.11-1.24.3-1.82V7.6H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.4l3.25-2.58Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.17c1.43 0 2.71.49 3.72 1.46l2.79-2.79A9.35 9.35 0 0 0 12 2.25 9.74 9.74 0 0 0 3.3 7.6l3.25 2.58c.77-2.3 2.92-4.01 5.45-4.01Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleSignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-describedby="google-sign-in-note"
      className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-primary bg-primary px-5 font-body text-[15px] leading-5 font-semibold text-white transition-colors duration-fast hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary disabled:cursor-wait disabled:border-disabled-bg disabled:bg-disabled-bg disabled:text-disabled-ink"
      disabled={pending}
      type="submit"
    >
      <GoogleMark />
      <span>{pending ? "Membuka Google..." : "Lanjutkan dengan Google"}</span>
    </button>
  );
}

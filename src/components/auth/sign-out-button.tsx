"use client";

import { SignOut } from "@phosphor-icons/react/SignOut";
import { useFormStatus } from "react-dom";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-md border border-primary bg-surface px-5 font-body text-[15px] leading-5 font-semibold text-primary transition-colors duration-fast hover:bg-primary-soft hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary disabled:cursor-wait disabled:border-disabled-bg disabled:bg-disabled-bg disabled:text-disabled-ink"
      disabled={pending}
      type="submit"
    >
      <SignOut aria-hidden="true" size={19} weight="bold" />
      <span>{pending ? "Keluar..." : "Keluar dari akun"}</span>
    </button>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth/session";
import { deleteStoredReceiptObjects } from "@/features/receipts/storage";

import {
  createWallet,
  deleteWalletWithData,
  listWalletReceiptObjectKeys,
  updateWallet,
  WalletDataError,
} from "./data";
import { walletFormSchema, walletMutationSchema } from "./validation";

type WalletStatus =
  "created" | "deleted" | "duplicate" | "error" | "invalid" | "renamed";

function finish(status: WalletStatus): never {
  redirect(`/profile?walletStatus=${status}#wallets`);
}

function mutationFailure(error: unknown): never {
  if (error instanceof WalletDataError) {
    if (error.code === "duplicate_name") finish("duplicate");
  }

  console.error("[Fintrack AI] Mutasi dompet gagal.", {
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  finish("error");
}

function revalidateWalletSurfaces() {
  revalidatePath("/");
  revalidatePath("/budgets");
  revalidatePath("/profile");
  revalidatePath("/scan");
  revalidatePath("/transactions");
  revalidatePath("/transactions/new");
}

export async function createWalletAction(formData: FormData) {
  const parsed = walletFormSchema.safeParse({
    name: formData.get("name"),
    walletType: formData.get("walletType"),
  });
  if (!parsed.success) finish("invalid");
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=%2Fprofile");

  try {
    await createWallet(userId, parsed.data.name, parsed.data.walletType);
  } catch (error) {
    mutationFailure(error);
  }

  revalidateWalletSurfaces();
  finish("created");
}

export async function updateWalletAction(formData: FormData) {
  const wallet = walletMutationSchema.safeParse({
    walletId: formData.get("walletId"),
  });
  const input = walletFormSchema.safeParse({
    name: formData.get("name"),
    walletType: formData.get("walletType"),
  });
  if (!wallet.success || !input.success) finish("invalid");
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=%2Fprofile");

  try {
    await updateWallet(
      userId,
      wallet.data.walletId,
      input.data.name,
      input.data.walletType,
    );
  } catch (error) {
    mutationFailure(error);
  }

  revalidateWalletSurfaces();
  finish("renamed");
}

export async function deleteWalletAction(formData: FormData) {
  const parsed = walletMutationSchema.safeParse({
    walletId: formData.get("walletId"),
  });
  if (!parsed.success) finish("invalid");
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=%2Fprofile");

  try {
    const receiptObjectKeys = await listWalletReceiptObjectKeys(
      userId,
      parsed.data.walletId,
    );
    await deleteStoredReceiptObjects(userId, receiptObjectKeys);
    await deleteWalletWithData(userId, parsed.data.walletId);
  } catch (error) {
    mutationFailure(error);
  }

  revalidateWalletSurfaces();
  finish("deleted");
}

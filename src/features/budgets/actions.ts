"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth/session";

import { deleteCategoryBudget, upsertCategoryBudget } from "./data";
import { parseBudgetDeleteForm, parseBudgetForm } from "./validation";

function budgetRedirect(
  status: "deleted" | "error" | "invalid" | "saved",
): never {
  redirect(`/budgets?status=${status}`);
}

export async function saveCategoryBudgetAction(formData: FormData) {
  const parsed = parseBudgetForm(formData);
  if (!parsed.success) return budgetRedirect("invalid");

  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=%2Fbudgets");

  try {
    await upsertCategoryBudget(userId, parsed.data);
  } catch (error) {
    console.error("[Fintrack AI] Budget belum tersimpan.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    budgetRedirect("error");
  }

  revalidatePath("/");
  revalidatePath("/budgets");
  budgetRedirect("saved");
}

export async function deleteCategoryBudgetAction(formData: FormData) {
  const parsed = parseBudgetDeleteForm(formData);
  if (!parsed.success) return budgetRedirect("invalid");

  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=%2Fbudgets");

  try {
    await deleteCategoryBudget(
      userId,
      parsed.data.categoryId,
      parsed.data.monthStart,
    );
  } catch (error) {
    console.error("[Fintrack AI] Budget belum dihapus.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    budgetRedirect("error");
  }

  revalidatePath("/");
  revalidatePath("/budgets");
  budgetRedirect("deleted");
}

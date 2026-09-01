import type { TransactionActionState, TransactionFormValues } from "./domain";

export function createInitialActionState(
  values: TransactionFormValues,
): TransactionActionState {
  return {
    fieldErrors: {},
    status: "idle",
    values,
  };
}

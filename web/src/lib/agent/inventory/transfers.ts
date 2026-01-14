import { TransferComponent } from "../types";
import { transfers } from "../../../data/transfers";

export function searchTransfers(): TransferComponent[] {
  return transfers;
}

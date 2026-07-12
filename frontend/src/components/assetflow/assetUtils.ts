import type { AssetStatus } from "./types";

export function canAllocate(status: AssetStatus) {
  return status === "Available";
}

export function canTransfer(status: AssetStatus) {
  return status === "Allocated";
}
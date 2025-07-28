import { defineStore } from "pinia";

export const useStockFiltersStore = defineStore("filters", () => {
  const page = ref<number | null>(null);
  const inWayToClient = ref<boolean | null>(null);
  const inWayFromClient = ref<boolean | null>(null);

  return { page, inWayToClient, inWayFromClient };
});

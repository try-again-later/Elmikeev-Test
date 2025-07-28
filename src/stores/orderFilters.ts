import { defineStore } from "pinia";

export const useOrderFiltersStore = defineStore("filters", () => {
  const dateFrom = ref<Date | null>(null);
  const dateTo = ref<Date | null>(null);
  const page = ref<number | null>(null);
  const warehouseNamesFilter = ref<string[] | null>(null);

  return { dateFrom, dateTo, page, warehouseNamesFilter };
});

import { defineStore } from "pinia";

export const useOrderFiltersStore = defineStore("orderFilters", () => {
  const dateFrom = ref<Date | null>(null);
  const dateTo = ref<Date | null>(null);
  const page = ref<number | null>(null);
  const warehouseNamesFilter = ref<string[] | null>(null);

  const partNamesFilter = ref<number[]>([]);
  const brandFilter = ref<string[]>([]);
  const categoryFilter = ref<string[]>([]);
  const regionFilter = ref<string[]>([]);

  return {
    dateFrom,
    dateTo,
    page,
    warehouseNamesFilter,
    partNamesFilter,
    brandFilter,
    categoryFilter,
    regionFilter,
  };
});

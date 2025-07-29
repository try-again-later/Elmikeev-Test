import { defineStore } from "pinia";

export const useSaleFiltersStore = defineStore("saleFilters", () => {
  const dateFrom = ref<Date | null>(null);
  const dateTo = ref<Date | null>(null);
  const page = ref<number | null>(null);
  const totalPriceRange = ref<[number, number] | null>(null);

  const partNamesFilter = ref<number[]>([]);
  const regionFilter = ref<string[]>([]);
  const brandFilter = ref<string[]>([]);
  const categoryFilter = ref<string[]>([]);

  return {
    dateFrom,
    dateTo,
    page,
    totalPriceRange,
    partNamesFilter,
    regionFilter,
    brandFilter,
    categoryFilter,
  };
});

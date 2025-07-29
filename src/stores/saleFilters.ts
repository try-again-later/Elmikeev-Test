import { defineStore } from "pinia";

export const useSaleFiltersStore = defineStore("saleFilters", () => {
  const dateFrom = ref<Date | null>(null);
  const dateTo = ref<Date | null>(null);
  const page = ref<number | null>(null);
  const totalPriceRange = ref<[number, number] | null>(null);

  return { dateFrom, dateTo, page, totalPriceRange };
});

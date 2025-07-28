import { defineStore } from "pinia";

export const useIncomeFiltersStore = defineStore("filters", () => {
  const dateFrom = ref<Date | null>(null);
  const dateTo = ref<Date | null>(null);
  const page = ref<number | null>(null);
  const quantityRange = ref<[number, number] | null>(null);

  return { dateFrom, dateTo, page, quantityRange };
});

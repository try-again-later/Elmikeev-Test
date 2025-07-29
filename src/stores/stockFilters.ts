import { defineStore } from "pinia";

export const useStockFiltersStore = defineStore("stockFilters", () => {
  type BooleanFilter = "Да" | "Нет" | "Не важно";

  const page = ref<number | null>(null);
  const inWayToClient = ref<BooleanFilter>('Не важно');
  const inWayFromClient = ref<BooleanFilter>('Не важно');

  return { page, inWayToClient, inWayFromClient };
});

import { defineStore } from "pinia";

export const useStockFiltersStore = defineStore("stockFilters", () => {
  type BooleanFilter = "Да" | "Нет" | "Не важно";

  const page = ref<number | null>(null);
  const inWayToClient = ref<BooleanFilter>("Не важно");
  const inWayFromClient = ref<BooleanFilter>("Не важно");

  const partNamesFilter = ref<number[]>([]);
  const brandFilter = ref<string[]>([]);
  const categoryFilter = ref<string[]>([]);

  return {
    page,
    inWayToClient,
    inWayFromClient,
    partNamesFilter,
    brandFilter,
    categoryFilter,
  };
});

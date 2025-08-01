import { defineStore } from "pinia";
import { subDays } from "date-fns";
import { useFetch } from "@vueuse/core";

import {
  ordersListRequestUrl,
  type OrdersListResponse,
} from "@/api/order/list";
import type { Order } from "@/api/order";

export const useOrderPeriodChanges = defineStore("orderPeriodChanges", () => {
  // Last week by default
  const currentPeriodDateFrom = ref(subDays(new Date(), 7));
  const currentPeriodDateTo = ref(new Date());

  // The week before the last week by default
  const previousPeriodDateFrom = ref(subDays(new Date(), 15));
  const previousPeriodDateTo = ref(subDays(new Date(), 8));

  // Fetching current period orders

  const currentPeriodUrl = computed(
    () =>
      ordersListRequestUrl({
        dateFrom: currentPeriodDateFrom.value,
        dateTo: currentPeriodDateTo.value,
        page: 1,
        limit: 500,
      }).href
  );

  const {
    execute: currentPeriodExecute,
    isFetching: currentPeriodIsFetching,
    error: currentPeriodError,
    data: currentPeriodResponse,
  } = useFetch(currentPeriodUrl, { refetch: true })
    .get()
    .json<OrdersListResponse>();

  const currentPeriodOrders = computed(() => {
    if (currentPeriodResponse.value == null) {
      return [];
    }
    return currentPeriodResponse.value.data;
  });

  // Fetching previous period orders

  const previousPeriodUrl = computed(
    () =>
      ordersListRequestUrl({
        dateFrom: previousPeriodDateFrom.value,
        dateTo: previousPeriodDateTo.value,
        page: 1,
        limit: 500,
      }).href
  );

  const {
    execute: previousPeriodExecute,
    isFetching: previousPeriodIsFetching,
    error: previousPeriodError,
    data: previousPeriodResponse,
  } = useFetch(previousPeriodUrl, { refetch: true })
    .get()
    .json<OrdersListResponse>();

  const previousPeriodOrders = computed(() => {
    if (previousPeriodResponse.value == null) {
      return [];
    }
    return previousPeriodResponse.value.data;
  });

  const isFetching = ref(false);
  watchEffect(() => {
    isFetching.value =
      currentPeriodIsFetching.value || previousPeriodIsFetching.value;
  });

  const hasError = computed(
    () => currentPeriodError.value != null || previousPeriodError.value != null
  );
  const retry = () => {
    currentPeriodExecute();
    previousPeriodExecute();
  };

  // Filters

  const allPartNames = computed(() => {
    return [
      ...new Set([
        ...previousPeriodOrders.value.map((order) => order.nm_id),
        ...currentPeriodOrders.value.map((order) => order.nm_id),
      ]),
    ];
  });
  const partNamesFilter = ref<number[]>([]);
  const partNamesFilterPredicate = (order: Order) =>
    partNamesFilter.value.length == 0 ||
    partNamesFilter.value.includes(order.nm_id);

  const allCategories = computed(() => {
    return [
      ...new Set([
        ...previousPeriodOrders.value.map((order) => order.category),
        ...currentPeriodOrders.value.map((order) => order.category),
      ]),
    ];
  });
  const categoryFilter = ref<string[]>([]);
  const categoryFilterPredicate = (order: Order) =>
    categoryFilter.value.length == 0 ||
    categoryFilter.value.includes(order.category);

  const allBrands = computed(() => {
    return [
      ...new Set([
        ...previousPeriodOrders.value.map((order) => order.brand),
        ...currentPeriodOrders.value.map((order) => order.brand),
      ]),
    ];
  });
  const brandFilter = ref<string[]>([]);
  const brandFilterPredicate = (order: Order) =>
    brandFilter.value.length == 0 || brandFilter.value.includes(order.brand);

  const allRegions = computed(() => {
    return [
      ...new Set([
        ...previousPeriodOrders.value.map((order) => order.oblast),
        ...currentPeriodOrders.value.map((order) => order.oblast),
      ]),
    ];
  });
  const regionFilter = ref<string[]>([]);
  const regionFilterPredicate = (order: Order) =>
    regionFilter.value.length == 0 || regionFilter.value.includes(order.oblast);

  // Filtered data

  const filteredCurrentPeriodOrders = computed(() => {
    return currentPeriodOrders.value.filter(
      (order) =>
        partNamesFilterPredicate(order) &&
        categoryFilterPredicate(order) &&
        brandFilterPredicate(order) &&
        regionFilterPredicate(order)
    );
  });

  const filteredPreviousPeriodOrders = computed(() => {
    return previousPeriodOrders.value.filter(
      (order) =>
        partNamesFilterPredicate(order) &&
        categoryFilterPredicate(order) &&
        brandFilterPredicate(order) &&
        regionFilterPredicate(order)
    );
  });

  return {
    currentPeriodDateFrom,
    currentPeriodDateTo,
    previousPeriodDateFrom,
    previousPeriodDateTo,

    isFetching,
    hasError,
    retry,

    currentPeriodOrders: filteredCurrentPeriodOrders,
    previousPeriodOrders: filteredPreviousPeriodOrders,

    allPartNames,
    partNamesFilter,

    allCategories,
    categoryFilter,

    allBrands,
    brandFilter,

    allRegions,
    regionFilter,
  };
});

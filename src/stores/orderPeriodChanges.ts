import { defineStore } from "pinia";
import { subDays } from "date-fns";
import { useFetch } from "@vueuse/core";

import {
  ordersListRequestUrl,
  type OrdersListResponse,
} from "@/api/order/list";

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
    isFetching.value = currentPeriodIsFetching.value || previousPeriodIsFetching.value;
  })

  const hasError = computed(
    () => currentPeriodError.value != null || previousPeriodError.value != null
  );
  const retry = () => {
    currentPeriodExecute();
    previousPeriodExecute();
  };

  return {
    currentPeriodDateFrom,
    currentPeriodDateTo,
    previousPeriodDateFrom,
    previousPeriodDateTo,

    isFetching,
    hasError,
    retry,

    currentPeriodOrders,
    previousPeriodOrders,
  };
});

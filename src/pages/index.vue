<template>
  <h1 class="mb-8">Главная</h1>
  <v-sheet>Текущий период</v-sheet>
  <v-row>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Начиная с даты"
        v-model="currentPeriodDateFrom"
      ></v-date-input>
    </v-col>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Заканчивая датой"
        v-model="currentPeriodDateTo"
      ></v-date-input>
    </v-col>
  </v-row>
  <v-sheet
    v-if="currentPeriodError != null"
    class="d-flex flex-column ga-4 align-center"
  >
    <p>Ошибка при загрузке данных</p>
    <v-btn @click="currentPeriodExecute">Попробовать ещё раз</v-btn>
  </v-sheet>
  <template v-if="currentPeriodError == null">
    <v-row>
      <v-col cols="12" sm="6" class="position-relative">
        <v-expansion-panels>
          <v-expansion-panel title="Количество продаж по каждому артикулу">
            <v-expansion-panel-text>
              <div
                :style="`position: relative; height: ${
                  partNames.length * 20
                }px; width: 100%`"
              >
                <Bar :data="countPerPartName" :options="chartCommonOptions" />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="12" sm="6" class="position-relative">
        <v-expansion-panels>
          <v-expansion-panel
            title="Суммарная стоимость продаж по каждому артикулу"
          >
            <v-expansion-panel-text>
              <div
                :style="`position: relative; height: ${
                  partNames.length * 20
                }px; width: 100%`"
              >
                <Bar
                  :data="totalPricePerPartName"
                  :options="chartCommonOptions"
                />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6" class="position-relative">
        <v-expansion-panels>
          <v-expansion-panel title="Количество отмен по каждому артикулу">
            <v-expansion-panel-text>
              <div
                :style="`position: relative; height: ${
                  cancelCountPerPartName.datasets[0].data.length * 20
                }px; width: 100%`"
              >
                <Bar
                  :data="cancelCountPerPartName"
                  :options="chartCommonOptions"
                />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="12" sm="6" class="position-relative">
        <v-expansion-panels>
          <v-expansion-panel title="Средняя скидка по каждому артикулу">
            <v-expansion-panel-text>
              <div
                :style="`position: relative; height: ${
                  partNames.length * 20
                }px; width: 100%`"
              >
                <Bar
                  :data="averageDiscountPerPartName"
                  :options="chartCommonOptions"
                />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </template>
</template>

<script setup lang="ts">
import { subMonths } from "date-fns";
import { useFetch } from "@vueuse/core";
import { useNProgress } from "@vueuse/integrations/useNProgress";
import { Bar } from "vue-chartjs";

import {
  ordersListRequestUrl,
  type OrdersListResponse,
} from "@/api/order/list";

const currentPeriodDateFrom = ref(subMonths(new Date(), 1));
const currentPeriodDateTo = ref(new Date());

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

const { isLoading } = useNProgress();
watch(currentPeriodIsFetching, (value) => {
  isLoading.value = value;
});

const currentPeriodOrders = computed(() => {
  if (currentPeriodResponse.value == null) {
    return [];
  }
  return currentPeriodResponse.value.data;
});

const partNames = computed(() => [
  ...new Set(currentPeriodOrders.value.map((item) => item.nm_id)),
]);

const chartCommonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y",
  scales: {
    x: {
      ticks: {
        display: true,
        autoSkip: false,
      },
      position: "top",
    },
  },
} as const;

const countPerPartName = computed(() => {
  const dataPerLabel: Record<number, number> = {};
  for (const order of currentPeriodOrders.value) {
    if (!(order.nm_id in dataPerLabel)) {
      dataPerLabel[order.nm_id] = 1;
    } else {
      dataPerLabel[order.nm_id] += 1;
    }
  }

  const data: number[] = [];
  for (const label of partNames.value) {
    data.push(dataPerLabel[label]);
  }

  return {
    labels: partNames.value,
    datasets: [
      {
        data,
        label: "Количество продаж по каждому артикулу",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});

const totalPricePerPartName = computed(() => {
  const dataPerLabel: Record<number, number> = {};
  for (const order of currentPeriodOrders.value) {
    if (!(order.nm_id in dataPerLabel)) {
      dataPerLabel[order.nm_id] = Number.parseFloat(order.total_price) || 0;
    } else {
      dataPerLabel[order.nm_id] += Number.parseFloat(order.total_price) || 0;
    }
  }

  const data: number[] = [];
  for (const label of partNames.value) {
    data.push(dataPerLabel[label]);
  }

  return {
    labels: partNames.value,
    datasets: [
      {
        data,
        label: "Суммарная стоимость продаж по каждому артикулу",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});

const cancelCountPerPartName = computed(() => {
  const dataPerLabel: Record<number, number> = {};
  for (const order of currentPeriodOrders.value) {
    if (order.is_cancel) {
      if (!(order.nm_id in dataPerLabel)) {
        dataPerLabel[order.nm_id] = 1;
      } else {
        dataPerLabel[order.nm_id] += 1;
      }
    }
  }

  const data: number[] = [];
  for (const label of partNames.value) {
    if (label in dataPerLabel) {
      data.push(dataPerLabel[label]);
    }
  }

  return {
    labels: Object.keys(dataPerLabel),
    datasets: [
      {
        data,
        label: "Количество отмен по каждому артикулу",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});

const averageDiscountPerPartName = computed(() => {
  const dataPerLabel: Record<number, { count: number; sum: number }> = {};
  for (const order of currentPeriodOrders.value) {
    if (!(order.nm_id in dataPerLabel)) {
      dataPerLabel[order.nm_id] = {
        count: 1,
        sum: order.discount_percent,
      };
    } else {
      dataPerLabel[order.nm_id].count += 1;
      dataPerLabel[order.nm_id].sum += order.discount_percent;
    }
  }

  const data: number[] = [];
  for (const label of partNames.value) {
    data.push(dataPerLabel[label].sum / dataPerLabel[label].count);
  }

  return {
    labels: partNames.value,
    datasets: [
      {
        data,
        label: "Средняя скидка по каждому артикулу",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});
</script>

<template>
  <h1 class="mb-8">Главная</h1>
  <v-sheet class="mb-2">Текущий период:</v-sheet>
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

  <v-sheet class="mb-2">Предыдущий период:</v-sheet>
  <v-row>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Начиная с даты"
        v-model="previousPeriodDateFrom"
      ></v-date-input>
    </v-col>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Заканчивая датой"
        v-model="previousPeriodDateTo"
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
                <Bar
                  :data="countPerPartNameChartData"
                  :options="chartCommonOptions"
                />
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
                  :data="totalPricePerPartNameChartData"
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
                  cancelCountPerPartNameChartData.datasets[0].data.length * 20
                }px; width: 100%`"
              >
                <Bar
                  :data="cancelCountPerPartNameChartData"
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
import { subDays } from "date-fns";
import { useFetch } from "@vueuse/core";
import { useNProgress } from "@vueuse/integrations/useNProgress";
import { Bar } from "vue-chartjs";

import {
  ordersListRequestUrl,
  type OrdersListResponse,
} from "@/api/order/list";
import orderCountPerPartName from "@/data/orderCountPerPartName";
import orderTotalPricePerPartName from "@/data/orderTotalPricePerPartName";
import orderCancelCountPerPartName from "@/data/orderCancelCountPerPartName";
import orderAverageDiscountPerPartName from "@/data/orderAverageDiscountPerPartName";

// Last week
const currentPeriodDateFrom = ref(subDays(new Date(), 7));
const currentPeriodDateTo = ref(new Date());

// The week before the last week
const previousPeriodDateFrom = ref(subDays(new Date(), 15));
const previousPeriodDateTo = ref(subDays(new Date(), 8));

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

const countPerPartNameChartData = computed(() => {
  const data = orderCountPerPartName(currentPeriodOrders.value);

  return {
    labels: data.map((entry) => entry.partName),
    datasets: [
      {
        data: data.map((entry) => entry.count),
        label: "Количество продаж по каждому артикулу",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});

const totalPricePerPartNameChartData = computed(() => {
  const data = orderTotalPricePerPartName(currentPeriodOrders.value);

  return {
    labels: data.map((entry) => entry.partName),
    datasets: [
      {
        data: data.map((entry) => entry.totalPrice),
        label: "Суммарная стоимость продаж по каждому артикулу",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});

const cancelCountPerPartNameChartData = computed(() => {
  const data = orderCancelCountPerPartName(currentPeriodOrders.value);

  return {
    labels: data.map((entry) => entry.partName),
    datasets: [
      {
        data: data.map((entry) => entry.cancelCount),
        label: "Количество отмен по каждому артикулу",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});

const averageDiscountPerPartName = computed(() => {
  const data = orderAverageDiscountPerPartName(currentPeriodOrders.value);

  return {
    labels: data.map((entry) => entry.partName),
    datasets: [
      {
        data: data.map((entry) => entry.averageDiscount),
        label: "Средняя скидка по каждому артикулу",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});
</script>

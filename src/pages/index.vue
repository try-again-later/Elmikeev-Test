<template>
  <h1 class="mb-8">Главная</h1>
  <v-sheet class="mb-2">Текущий период:</v-sheet>
  <v-row>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Начиная с даты"
        v-model="orders.currentPeriodDateFrom"
      ></v-date-input>
    </v-col>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Заканчивая датой"
        v-model="orders.currentPeriodDateTo"
      ></v-date-input>
    </v-col>
  </v-row>

  <v-sheet class="mb-2">Предыдущий период:</v-sheet>
  <v-row>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Начиная с даты"
        v-model="orders.previousPeriodDateFrom"
      ></v-date-input>
    </v-col>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Заканчивая датой"
        v-model="orders.previousPeriodDateTo"
      ></v-date-input>
    </v-col>
  </v-row>

  <v-sheet v-if="orders.hasError" class="d-flex flex-column ga-4 align-center">
    <p>Ошибка при загрузке данных</p>
    <v-btn @click="orders.retry">Попробовать ещё раз</v-btn>
  </v-sheet>
  <template v-if="!orders.hasError">
    <v-row>
      <v-col cols="12" sm="6" class="position-relative">
        <v-expansion-panels>
          <v-expansion-panel title="Количество продаж по каждому артикулу">
            <v-expansion-panel-text>
              <div
                :style="`position: relative; height: ${
                  currentPeriodPartNames.length * 20
                }px; width: 100%`"
              >
                <Bar
                  :data="countPerPartNameChartData"
                  :options="chartCommonOptions"
                />
              </div>

              <v-sheet class="my-2">Топ 20 изменений по продажам:</v-sheet>
              <v-table>
                <thead>
                  <tr>
                    <th>Артикул</th>
                    <th>Количество продаж в предыдущем периоде</th>
                    <th>Количество продаж в текущем периоде</th>
                    <th>Процент изменения</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in orderCountsChanges">
                    <td>{{ entry.partName }}</td>
                    <td>{{ entry.previousOrderCount }}</td>
                    <td>{{ entry.currentOrderCount }}</td>
                    <td>
                      <PercentageChange :change="entry.change" />
                    </td>
                  </tr>
                </tbody>
              </v-table>
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
                  currentPeriodPartNames.length * 20
                }px; width: 100%`"
              >
                <Bar
                  :data="totalPricePerPartNameChartData"
                  :options="chartCommonOptions"
                />
              </div>

              <v-sheet class="my-2">
                Топ 20 изменений по суммарной стоимости продаж:
              </v-sheet>
              <v-table>
                <thead>
                  <tr>
                    <th>Артикул</th>
                    <th>Сумма за предыдущий период</th>
                    <th>Сумма за текущий период</th>
                    <th>Процент изменения</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in orderTotalPriceChanges">
                    <td>{{ entry.partName }}</td>
                    <td>{{ entry.previousTotalPrice.toFixed(2) }}</td>
                    <td>{{ entry.currentTotalPrice.toFixed(2) }}</td>
                    <td>
                      <PercentageChange :change="entry.change" />
                    </td>
                  </tr>
                </tbody>
              </v-table>
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

              <v-sheet class="my-2">
                Топ 20 изменений по количеству отмен:
              </v-sheet>
              <v-table>
                <thead>
                  <tr>
                    <th>Артикул</th>
                    <th>Отмен за предыдущий период</th>
                    <th>Отмен за текущий период</th>
                    <th>Процент изменения</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in orderCancelCountChanges">
                    <td>{{ entry.partName }}</td>
                    <td>{{ entry.previousCancelCount }}</td>
                    <td>{{ entry.currentCancelCount }}</td>
                    <td>
                      <PercentageChange :change="entry.change" />
                    </td>
                  </tr>
                </tbody>
              </v-table>
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
                  currentPeriodPartNames.length * 20
                }px; width: 100%`"
              >
                <Bar
                  :data="averageDiscountPerPartName"
                  :options="chartCommonOptions"
                />
              </div>

              <v-sheet class="my-2">
                Топ 20 изменений по средней скидке:
              </v-sheet>
              <v-table>
                <thead>
                  <tr>
                    <th>Артикул</th>
                    <th>Средняя скидка за предыдущий период</th>
                    <th>Средняя скидка за текущий период</th>
                    <th>Процент изменения</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in orderAverageDiscountChanges">
                    <td>{{ entry.partName }}</td>
                    <td>{{ entry.previousAverageDiscount.toFixed(2) }}</td>
                    <td>{{ entry.currentAverageDiscount.toFixed(2) }}</td>
                    <td>
                      <PercentageChange :change="entry.change" />
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </template>
</template>

<script setup lang="ts">
import { useNProgress } from "@vueuse/integrations/useNProgress";
import { Bar } from "vue-chartjs";

import orderCountPerPartName, {
  compareOrderCounts,
} from "@/data/orderCountPerPartName";
import orderTotalPricePerPartName, {
  compareOrderTotalPrices,
} from "@/data/orderTotalPricePerPartName";
import orderCancelCountPerPartName, {
  compareOrderCancelCounts,
} from "@/data/orderCancelCountPerPartName";
import orderAverageDiscountPerPartName, {
  compareOrderAverageDiscounts,
} from "@/data/orderAverageDiscountPerPartName";
import { useOrderPeriodChanges } from "@/stores/orderPeriodChanges";

const orders = useOrderPeriodChanges();

// Loading bar

const { isLoading } = useNProgress();
watchEffect(() => {
  isLoading.value = orders.isFetching;
});

// Data for drawing tables comparing the current and the previous periods

const orderCountsChanges = computed(() => {
  return compareOrderCounts(
    orders.previousPeriodOrders,
    orders.currentPeriodOrders
  ).slice(0, 20);
});

const orderTotalPriceChanges = computed(() => {
  return compareOrderTotalPrices(
    orders.previousPeriodOrders,
    orders.currentPeriodOrders
  ).slice(0, 20);
});

const orderCancelCountChanges = computed(() => {
  return compareOrderCancelCounts(
    orders.previousPeriodOrders,
    orders.currentPeriodOrders
  ).slice(0, 20);
});

const orderAverageDiscountChanges = computed(() => {
  return compareOrderAverageDiscounts(
    orders.previousPeriodOrders,
    orders.currentPeriodOrders
  ).slice(0, 20);
});

// Data for drawing charts for the current period

const currentPeriodPartNames = computed(() => [
  ...new Set(orders.currentPeriodOrders.map((item) => item.nm_id)),
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
  const data = orderCountPerPartName(orders.currentPeriodOrders);

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
  const data = orderTotalPricePerPartName(orders.currentPeriodOrders);

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
  const data = orderCancelCountPerPartName(orders.currentPeriodOrders);

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
  const data = orderAverageDiscountPerPartName(orders.currentPeriodOrders);

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

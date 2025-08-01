<template>
  <v-sheet
    class="position-relative w-100"
    :height="totalPricePerPartNameChartData.maxHeight"
    :min-height="200"
  >
    <Bar
      :data="totalPricePerPartNameChartData"
      :options="chartCommonOptions"
      @click="
        $router.push({
          path: '/order-changes/prices',
        })
      "
    />
  </v-sheet>

  <v-btn
    variant="outlined"
    class="my-4"
    v-if="!showFullTable"
    :to="{ path: '/order-changes/prices' }"
  >
    Перейти на страницу показателя
  </v-btn>

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
        <td>
          <v-btn
            variant="tonal"
            size="small"
            :to="{ path: `/order/${entry.partName}` }"
          >
            {{ entry.partName }}
          </v-btn>
        </td>
        <td>{{ entry.previousTotalPrice.toFixed(2) }}</td>
        <td>{{ entry.currentTotalPrice.toFixed(2) }}</td>
        <td>
          <PercentageChange :change="entry.change" />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import orderTotalPricePerPartName, {
  compareOrderTotalPrices,
} from "@/data/orderTotalPricePerPartName";
import { useOrderPeriodChanges } from "@/stores/orderPeriodChanges";
import { useNProgress } from "@vueuse/integrations/useNProgress.mjs";
import { Bar } from "vue-chartjs";

const { showFullTable } = defineProps<{ showFullTable: boolean }>();

const orders = useOrderPeriodChanges();

const { isLoading } = useNProgress();
watchEffect(() => {
  isLoading.value = orders.isFetching;
});

const orderTotalPriceChanges = computed(() => {
  let data = compareOrderTotalPrices(
    orders.previousPeriodOrders,
    orders.currentPeriodOrders
  );
  if (!showFullTable) {
    data = data.slice(0, 20);
  }
  return data;
});

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
    maxHeight: data.length * 20,
  };
});
</script>

<template>
  <v-sheet
    class="position-relative w-100"
    :height="averageDiscountPerPartNameChartData.maxHeight"
    :min-height="200"
  >
    <Bar
      :data="averageDiscountPerPartNameChartData"
      :options="chartCommonOptions"
      @click="
        $router.push({
          path: '/order-changes/average-discounts',
        })
      "
    />
  </v-sheet>

  <v-btn
    variant="outlined"
    size="x-small"
    class="my-4"
    v-if="!showFullTable"
    :to="{
      path: '/order-changes/average-discounts',
    }"
  >
    Перейти на страницу показателя
  </v-btn>

  <v-sheet class="my-2"> Топ 20 изменений по средней скидке: </v-sheet>
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
        <td>
          <v-btn
            variant="tonal"
            size="small"
            :to="{ path: `/order/${entry.partName}` }"
          >
            {{ entry.partName }}
          </v-btn>
        </td>
        <td>{{ entry.previousAverageDiscount.toFixed(2) }}</td>
        <td>{{ entry.currentAverageDiscount.toFixed(2) }}</td>
        <td>
          <PercentageChange :change="entry.change" />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import orderAverageDiscountPerPartName, {
  compareOrderAverageDiscounts,
} from "@/data/orderAverageDiscountPerPartName";
import { useOrderPeriodChanges } from "@/stores/orderPeriodChanges";
import { useNProgress } from "@vueuse/integrations/useNProgress.mjs";
import { Bar } from "vue-chartjs";

const { showFullTable } = defineProps<{ showFullTable: boolean }>();

const orders = useOrderPeriodChanges();

const { isLoading } = useNProgress();
watchEffect(() => {
  isLoading.value = orders.isFetching;
});

const orderAverageDiscountChanges = computed(() => {
  let data = compareOrderAverageDiscounts(
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

const averageDiscountPerPartNameChartData = computed(() => {
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
    maxHeight: data.length * 20,
  };
});
</script>

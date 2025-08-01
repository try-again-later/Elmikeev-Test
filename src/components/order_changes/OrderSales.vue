<template>
  <v-sheet
    class="position-relative w-100"
    :height="countPerPartNameChartData.maxHeight"
    :min-height="200"
  >
    <Bar
      :data="countPerPartNameChartData"
      :options="chartCommonOptions"
      @click="$router.push({ path: '/order-changes/sales' })"
    />
  </v-sheet>

  <v-btn
    variant="outlined"
    size="x-small"
    class="my-4"
    v-if="!showFullTable"
    :to="{ path: '/order-changes/sales' }"
  >
    Перейти на страницу показателя
  </v-btn>

  <v-sheet class="my-2" v-if="!showFullTable">
    Топ 20 изменений по количеству продаж:
  </v-sheet>
  <v-sheet class="my-2" v-else> Изменения по количеству продаж: </v-sheet>
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
      <tr
        v-for="entry in orderCountsChanges"
        @click="$router.push({ path: `/order/${entry.partName}` })"
        class="cursor-pointer"
      >
        <td>
          <v-btn
            variant="tonal"
            size="small"
            :to="{ path: `/order/${entry.partName}` }"
          >
            {{ entry.partName }}
          </v-btn>
        </td>
        <td>{{ entry.previousOrderCount }}</td>
        <td>{{ entry.currentOrderCount }}</td>
        <td>
          <PercentageChange :change="entry.change" />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import orderCountPerPartName, {
  compareOrderCounts,
} from "@/data/orderCountPerPartName";
import { useOrderPeriodChanges } from "@/stores/orderPeriodChanges";
import { useNProgress } from "@vueuse/integrations/useNProgress.mjs";

const { showFullTable } = defineProps<{ showFullTable: boolean }>();

const orders = useOrderPeriodChanges();

const { isLoading } = useNProgress();
watchEffect(() => {
  isLoading.value = orders.isFetching;
});

const orderCountsChanges = computed(() => {
  let data = compareOrderCounts(
    orders.previousPeriodOrders,
    orders.currentPeriodOrders
  );
  if (!showFullTable) {
    data = data.slice(0, 20);
  }
  return data;
});

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
    maxHeight: data.length * 20,
  };
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
</script>

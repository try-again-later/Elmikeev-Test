<template>
  <v-sheet
    class="position-relative w-100"
    :height="cancelCountPerPartNameChartData.maxHeight"
    :min-height="200"
  >
    <Bar
      :data="cancelCountPerPartNameChartData"
      :options="chartCommonOptions"
      @click="
        $router.push({
          path: '/order-changes/cancels',
        })
      "
    />
  </v-sheet>

  <v-btn
    variant="outlined"
    class="my-4"
    v-if="!showFullTable"
    :to="{ path: '/order-changes/cancels' }"
  >
    Перейти на страницу показателя
  </v-btn>

  <v-sheet class="my-2"> Топ 20 изменений по количеству отмен: </v-sheet>
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
        <td>
          <v-btn
            variant="tonal"
            size="small"
            :to="{ path: `/order/${entry.partName}` }"
          >
            {{ entry.partName }}
          </v-btn>
        </td>
        <td>{{ entry.previousCancelCount }}</td>
        <td>{{ entry.currentCancelCount }}</td>
        <td>
          <PercentageChange :change="entry.change" />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import orderCancelCountPerPartName, {
  compareOrderCancelCounts,
} from "@/data/orderCancelCountPerPartName";
import { useOrderPeriodChanges } from "@/stores/orderPeriodChanges";
import { useNProgress } from "@vueuse/integrations/useNProgress.mjs";
import { Bar } from "vue-chartjs";

const { showFullTable } = defineProps<{ showFullTable: boolean }>();

const orders = useOrderPeriodChanges();

const { isLoading } = useNProgress();
watchEffect(() => {
  isLoading.value = orders.isFetching;
});

const orderCancelCountChanges = computed(() => {
  let data = compareOrderCancelCounts(
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
    maxHeight: data.length * 20,
  };
});
</script>

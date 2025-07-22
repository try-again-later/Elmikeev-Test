<template>
  <h1 class="mb-8">Заказы</h1>
  <div style="position: relative; height: 500px; width: 100%">
    <Bar
      :data="chartData"
      :options="{
        responsive: true,
        maintainAspectRatio: false,
      }"
    />
  </div>
  <v-row>
    <v-col cols="12" sm="6">
      <v-date-input label="Начиная с даты" v-model="dateFrom"></v-date-input>
    </v-col>
    <v-col cols="12" sm="6">
      <v-date-input label="Заканчивая датой" v-model="dateTo"></v-date-input>
    </v-col>
  </v-row>
  <div class="d-flex align-center ga-4">
    <v-btn
      :disabled="warehouseNamesFilter.length == warehouseNames.length"
      @click="warehouseNamesFilter = warehouseNames"
      >Сбросить</v-btn
    >
    <v-select
      v-model="warehouseNamesFilter"
      :items="warehouseNames"
      label="Названия складов"
      multiple
      persistent-hint
    ></v-select>
  </div>
  <v-sheet v-if="error != null" class="d-flex flex-column ga-4 align-center">
    <p>Ошибка при загрузке данных</p>
    <v-btn @click="execute">Попробовать ещё раз</v-btn>
  </v-sheet>
  <template v-if="error == null">
    <v-table fixed-header striped="even" class="mt-8">
      <thead>
        <tr>
          <th>Штрих-код</th>
          <th>Дата</th>
          <th>Полная сумма</th>
          <th>Скидка</th>
          <th>Отменён</th>
          <th>Регион</th>
          <th>Склад</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredData">
          <td>{{ item.barcode }}</td>
          <td>{{ item.date }}</td>
          <td>{{ parseFloat(item.total_price).toFixed(2) }}</td>
          <td>{{ `${item.discount_percent}%` }}</td>
          <td>{{ item.is_cancel ? "Да" : "Нет" }}</td>
          <td>{{ item.oblast }}</td>
          <td>{{ item.warehouse_name }}</td>
        </tr>
      </tbody>
    </v-table>

    <div class="text-center">
      <v-pagination
        v-model="page"
        :length="response?.meta.last_page"
        :density="$vuetify.display.smAndDown ? 'compact' : 'default'"
        :total-visible="$vuetify.display.smAndDown ? 2 : 5"
      ></v-pagination>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFetch } from "@vueuse/core";
import { useRouteQuery } from "@vueuse/router";
import {
  ordersListRequestUrl,
  type OrdersListResponse,
} from "@/api/order/list";
import useDateRangeQuery from "@/composables/useDateRangeQuery";
import { useNProgress } from "@vueuse/integrations/useNProgress";
import { Bar } from "vue-chartjs";

const { dateFrom, dateTo } = useDateRangeQuery();

const page = useRouteQuery("page", "1", { transform: Number });
watch(dateFrom, () => {
  page.value = 1;
});
watch(dateTo, () => {
  page.value = 1;
});

const url = computed(
  () =>
    ordersListRequestUrl({
      dateFrom: dateFrom.value ?? new Date(),
      dateTo: dateTo.value ?? new Date(),
      page: page.value,
      limit: 100,
    }).href
);

const {
  execute,
  isFetching,
  error,
  data: response,
} = useFetch(url, { refetch: true }).get().json<OrdersListResponse>();

const { isLoading } = useNProgress();
watch(isFetching, (value) => {
  isLoading.value = value;
});

const warehouseNames = ref<string[]>([]);
const warehouseNamesFilter = ref<string[]>([]);

watch(response, (newResponse) => {
  if (newResponse != null) {
    const selectionWasFull =
      warehouseNames.value.length == warehouseNamesFilter.value.length;

    warehouseNames.value = [
      ...new Set([
        ...newResponse.data.map((item) => item.warehouse_name),
        ...warehouseNames.value,
      ]),
    ];
    if (warehouseNamesFilter.value.length == 0 || selectionWasFull) {
      warehouseNamesFilter.value = warehouseNames.value;
    }
  }
});

const filteredData = computed(() => {
  if (response.value == null) {
    return [];
  }
  return response.value.data.filter((item) =>
    warehouseNamesFilter.value.includes(item.warehouse_name)
  );
});

const chartData = computed(() => {
  const warehouses = [
    ...new Set(filteredData.value.map((item) => item.warehouse_name)),
  ];
  const data = [];
  for (const warehouse of warehouses) {
    const orderCount = filteredData.value.reduce(
      (count, item) => (item.warehouse_name == warehouse ? 1 : 0) + count,
      0
    );
    data.push(orderCount);
  }

  return {
    labels: warehouses,
    datasets: [{ data, label: "Количество заказов по каждому складу" }],
  };
});
</script>

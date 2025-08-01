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
          <th>
            <v-select
              v-model="partNamesFilter"
              :items="partNames"
              min-width="200"
              max-width="400"
              label="Артикул"
              multiple
            ></v-select>
          </th>
          <th>Штрих-код</th>
          <th>Дата</th>
          <th>
            <v-select
              v-model="brandFilter"
              :items="brands"
              min-width="200"
              max-width="400"
              label="Брэнд"
              multiple
            ></v-select>
          </th>
          <th>
            <v-select
              v-model="categoryFilter"
              :items="categories"
              min-width="200"
              max-width="400"
              label="Категория"
              multiple
            ></v-select>
          </th>
          <th>Полная сумма</th>
          <th>Скидка</th>
          <th>Отменён</th>
          <th>
            <v-select
              v-model="regionFilter"
              :items="regions"
              min-width="200"
              max-width="400"
              label="Регион"
              multiple
            ></v-select>
          </th>
          <th>Склад</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredData">
          <td>{{ item.nm_id }}</td>
          <td>{{ item.barcode }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.brand }}</td>
          <td>{{ item.category }}</td>
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
import { subMonths } from "date-fns";
import { useOrderFiltersStore } from "@/stores/orderFilters";

const filtersStore = useOrderFiltersStore();

const { dateFrom, dateTo } = useDateRangeQuery();

const page = useRouteQuery("page", "1", { transform: Number });
watch(dateFrom, () => {
  page.value = 1;
});
watch(dateTo, () => {
  page.value = 1;
});

const defaultDateFrom = subMonths(new Date(), 1);
const defaultDateTo = new Date();

const url = computed(
  () =>
    ordersListRequestUrl({
      dateFrom: dateFrom.value ?? defaultDateFrom,
      dateTo: dateTo.value ?? defaultDateTo,
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

const warehouseNamesFilterQuery = useRouteQuery<string | null>(
  "warehouses",
  null
);
const warehouseNamesFilter = computed<string[]>({
  get() {
    if (warehouseNamesFilterQuery.value == null) {
      return warehouseNames.value;
    } else {
      return warehouseNamesFilterQuery.value.split(",");
    }
  },
  set(value) {
    if (value.length == warehouseNames.value.length) {
      warehouseNamesFilterQuery.value = null;
    } else {
      warehouseNamesFilterQuery.value = value.join(",");
    }
  },
});

const partNames = ref<number[]>([]);
const partNamesFilter = ref<number[]>(filtersStore.partNamesFilter);

const brands = ref<string[]>([]);
const brandFilter = ref<string[]>(filtersStore.brandFilter);

const categories = ref<string[]>([]);
const categoryFilter = ref<string[]>(filtersStore.categoryFilter);

const regions = ref<string[]>([]);
const regionFilter = ref<string[]>(filtersStore.regionFilter);

watchEffect(() => {
  filtersStore.dateFrom = dateFrom.value;
  filtersStore.dateTo = dateTo.value;
  filtersStore.page = page.value;

  if (warehouseNames.value.length != warehouseNamesFilter.value.length) {
    filtersStore.warehouseNamesFilter = warehouseNamesFilter.value;
  } else {
    filtersStore.warehouseNamesFilter = null;
  }

  filtersStore.partNamesFilter = partNamesFilter.value;
  filtersStore.brandFilter = brandFilter.value;
  filtersStore.categoryFilter = categoryFilter.value;
  filtersStore.regionFilter = regionFilter.value;
});

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

    partNames.value = [
      ...new Set([
        ...newResponse.data.map((item) => item.nm_id),
        ...partNamesFilter.value,
      ]),
    ];

    brands.value = [
      ...new Set([
        ...newResponse.data.map((item) => item.brand),
        ...brandFilter.value,
      ]),
    ];

    categories.value = [
      ...new Set([
        ...newResponse.data.map((item) => item.category),
        ...categoryFilter.value,
      ]),
    ];

    regions.value = [
      ...new Set([
        ...newResponse.data.map((item) => item.oblast),
        ...regionFilter.value,
      ]),
    ];
  }
});

const filteredData = computed(() => {
  if (response.value == null) {
    return [];
  }
  return response.value.data.filter(
    (item) =>
      warehouseNamesFilter.value.includes(item.warehouse_name) &&
      (partNamesFilter.value.length == 0 ||
        partNamesFilter.value.includes(item.nm_id)) &&
      (brandFilter.value.length == 0 ||
        brandFilter.value.includes(item.brand)) &&
      (categoryFilter.value.length == 0 ||
        categoryFilter.value.includes(item.category)) &&
      (regionFilter.value.length == 0 ||
        regionFilter.value.includes(item.oblast))
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
    datasets: [
      {
        data,
        label: "Количество заказов по каждому складу",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});
</script>

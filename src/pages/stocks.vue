<template>
  <h1 class="mb-8">Склады</h1>
  <v-row>
    <v-col cols="12" sm="6" class="position-relative" height="500">
      <Pie
        :data="{
          labels: ['Да', 'Нет'],
          datasets: [
            {
              label: 'В пути к клиенту',
              data: inWayToClientChartData,
              backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
            },
          ],
        }"
        :options="{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'В пути к клиенту',
            },
          },
        }"
      />
    </v-col>
    <v-col cols="12" sm="6" class="position-relative" height="500">
      <Pie
        :data="{
          labels: ['Да', 'Нет'],
          datasets: [
            {
              label: 'В пути от клиента',
              data: inWayFromClientChartData,
              backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
            },
          ],
        }"
        :options="{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'В пути от клиента',
            },
          },
        }"
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" sm="6">
      <v-select
        label="В пути к клиенту"
        v-model="inWayToClient"
        :items="['Да', 'Нет', 'Не важно']"
      ></v-select>
    </v-col>
    <v-col cols="12" sm="6">
      <v-select
        label="В пути от клиента"
        v-model="inWayFromClient"
        :items="['Да', 'Нет', 'Не важно']"
      ></v-select>
    </v-col>
  </v-row>
  <template v-if="error == null">
    <v-table fixed-header striped="even" class="mt-8">
      <thead>
        <tr>
          <th>
            <v-select
              v-model="partNamesFilter"
              :items="partNames"
              max-width="250"
              label="Артикул"
              multiple
            ></v-select>
          </th>
          <th>Штрих-код</th>
          <th>Дата</th>
          <th>Склад</th>
          <th>Стоимость</th>
          <th>В пути к клиенту</th>
          <th>В пути от клиента</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredData">
          <td>{{ item.nm_id }}</td>
          <td>{{ item.barcode }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.warehouse_name }}</td>
          <td>{{ item.price ?? 0 }}</td>
          <td>{{ item.in_way_to_client ? "Да" : "Нет" }}</td>
          <td>{{ item.in_way_from_client ? "Да" : "Нет" }}</td>
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
  stocksListRequestUrl,
  type StocksListResponse,
} from "@/api/stock/list";
import { startOfToday } from "date-fns";
import { Pie } from "vue-chartjs";
import { useStockFiltersStore } from "@/stores/stockFilters";

const filtersStore = useStockFiltersStore();

const page = useRouteQuery("page", "1", { transform: Number });

const url = computed(
  () =>
    stocksListRequestUrl({
      dateFrom: startOfToday(),
      dateTo: new Date(),
      page: page.value,
      limit: 100,
    }).href
);

const { error, data: response } = useFetch(url, { refetch: true })
  .get()
  .json<StocksListResponse>();

type BooleanFilter = "Да" | "Нет" | "Не важно";

const inWayToClientQuery = useRouteQuery<BooleanFilter>(
  "in-way-to-client",
  "Не важно"
);
const inWayToClient = computed<BooleanFilter>({
  get() {
    return inWayToClientQuery.value;
  },
  set(value) {
    inWayToClientQuery.value = value;
  },
});

const inWayFromClientQuery = useRouteQuery<BooleanFilter>(
  "in-way-from-client",
  "Не важно"
);
const inWayFromClient = computed<BooleanFilter>({
  get() {
    return inWayFromClientQuery.value;
  },
  set(value) {
    inWayFromClientQuery.value = value;
  },
});

const partNames = ref<number[]>([]);
const partNamesFilter = ref<number[]>([]);

watchEffect(() => {
  filtersStore.page = page.value;
  filtersStore.inWayFromClient = inWayFromClient.value;
  filtersStore.inWayToClient = inWayToClient.value;
});

watch(response, (newResponse) => {
  if (newResponse != null) {
    partNames.value = [
      ...new Set([...newResponse.data.map((item) => item.nm_id)]),
    ];
    partNamesFilter.value = [];
  }
});

const filteredData = computed(() => {
  if (response.value == null) {
    return [];
  }
  return response.value.data.filter((item) => {
    let isIncluded = true;

    if (inWayToClient.value != "Не важно") {
      isIncluded &&=
        (inWayToClient.value == "Да" && item.in_way_to_client) ||
        (inWayToClient.value == "Нет" && !item.in_way_to_client);
    }
    if (inWayFromClient.value != "Не важно") {
      isIncluded &&=
        (inWayFromClient.value == "Да" && item.in_way_from_client) ||
        (inWayFromClient.value == "Нет" && !item.in_way_from_client);
    }

    isIncluded &&=
      partNamesFilter.value.length == 0 ||
      (partNamesFilter.value.length > 0 &&
        partNamesFilter.value.includes(item.nm_id));

    return isIncluded;
  });
});

const inWayToClientChartData = computed(() => {
  const chartData = [0, 0];
  chartData[0] = filteredData.value.reduce(
    (count, item) => count + (item.in_way_to_client ? 1 : 0),
    0
  );
  chartData[1] = filteredData.value.length - chartData[0];

  return chartData;
});

const inWayFromClientChartData = computed(() => {
  const chartData = [0, 0];
  chartData[0] = filteredData.value.reduce(
    (count, item) => count + (item.in_way_from_client ? 1 : 0),
    0
  );
  chartData[1] = filteredData.value.length - chartData[0];

  return chartData;
});
</script>

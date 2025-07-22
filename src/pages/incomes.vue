<template>
  <h1 class="mb-8">Доходы</h1>
  <v-sheet class="position-relative" height="500">
    <Bar
      :data="chartData"
      :options="{
        responsive: true,
        maintainAspectRatio: false,
      }"
    />
  </v-sheet>
  <v-row>
    <v-col cols="12" sm="6">
      <v-date-input label="Начиная с даты" v-model="dateFrom"></v-date-input>
    </v-col>
    <v-col cols="12" sm="6">
      <v-date-input label="Заканчивая датой" v-model="dateTo"></v-date-input>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" md="1" class="d-flex align-center"
      >Фильтр по количеству:</v-col
    >
    <v-col>
      <v-range-slider
        v-model="quantityRange"
        :max="quantityMax"
        :min="quantityMin"
        :step="1"
        class="align-center"
        hide-details
      >
        <template v-slot:prepend>
          <v-text-field
            v-model="quantityRange[0]"
            density="compact"
            style="width: 100px"
            type="number"
            variant="outlined"
            hide-details
            single-line
          ></v-text-field>
        </template>
        <template v-slot:append>
          <v-text-field
            v-model="quantityRange[1]"
            density="compact"
            style="width: 100px"
            type="number"
            variant="outlined"
            hide-details
            single-line
          ></v-text-field>
        </template>
      </v-range-slider>
    </v-col>
  </v-row>
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
          <th>Дата закрытия</th>
          <th>Количество</th>
          <th>Склад</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredData">
          <td>{{ item.barcode }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.date_close }}</td>
          <td>{{ item.quantity }}</td>
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
  incomesListRequestUrl,
  type IncomesListResponse,
} from "@/api/income/list";
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
    incomesListRequestUrl({
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
} = useFetch(url, { refetch: true }).get().json<IncomesListResponse>();

const { isLoading } = useNProgress();
watch(isFetching, (value) => {
  isLoading.value = value;
});

const quantityMin = ref(0);
const quantityMax = ref(0);
const quantityRange = ref([quantityMin.value, quantityMax.value]);

watch(response, (newResponse) => {
  if (newResponse != null) {
    const quantityFilterWasMaxed = quantityRange.value[1] == quantityMax.value;

    quantityMin.value = 0;
    quantityMax.value = Math.max(
      Math.ceil(
        newResponse.data.reduce((max, item) => Math.max(max, item.quantity), 0)
      ),
      quantityMax.value
    );

    // Update filter to the new maximum value, if it wasn't changed by the user.
    if (quantityRange.value[1] == 0 || quantityFilterWasMaxed) {
      quantityRange.value[1] = quantityMax.value;
    }
  }
});

const filteredData = computed(() => {
  if (response.value == null) {
    return [];
  }
  return response.value.data.filter(
    (item) =>
      quantityRange.value[0] <= item.quantity &&
      item.quantity <= quantityRange.value[1]
  );
});

const chartData = computed(() => {
  const warehouses = [
    ...new Set(filteredData.value.map((item) => item.warehouse_name)),
  ];
  const data = [];
  for (const warehouse of warehouses) {
    const regionSum = filteredData.value.reduce(
      (sum, item) =>
        (item.warehouse_name == warehouse ? item.quantity : 0) + sum,
      0
    );
    data.push(regionSum);
  }

  return {
    labels: warehouses,
    datasets: [{ data, label: "Суммарное количество в каждом складе" }],
  };
});
</script>

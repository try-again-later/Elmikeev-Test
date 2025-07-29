<template>
  <h1 class="mb-8">Продажи</h1>
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
    <v-col cols="12" md="1" class="d-flex align-center">Полная сумма:</v-col>
    <v-col>
      <v-range-slider
        v-model="totalPriceRange"
        :max="totalPriceMax"
        :min="totalPriceMin"
        :step="1"
        class="align-center"
        hide-details
      >
        <template v-slot:prepend>
          <v-text-field
            v-model="totalPriceRange[0]"
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
            v-model="totalPriceRange[1]"
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
          <th>ID</th>
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
          <td>{{ item.sale_id }}</td>
          <td>{{ item.barcode }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.brand }}</td>
          <td>{{ item.category }}</td>
          <td>{{ parseFloat(item.total_price).toFixed(2) }}</td>
          <td>{{ `${item.discount_percent}%` }}</td>
          <td>{{ item.region_name }}</td>
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
import { useNProgress } from "@vueuse/integrations/useNProgress";
import { salesListRequestUrl, type SalesListResponse } from "@/api/sale/list";
import useDateRangeQuery from "@/composables/useDateRangeQuery";
import { Bar } from "vue-chartjs";
import { subMonths } from "date-fns";
import { useSaleFiltersStore } from "@/stores/saleFilters";

const filtersStore = useSaleFiltersStore();

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

const url = computed(() => {
  return salesListRequestUrl({
    dateFrom: dateFrom.value ?? defaultDateFrom,
    dateTo: dateTo.value ?? defaultDateTo,
    page: page.value,
    limit: 100,
  }).href;
});

const {
  execute,
  isFetching,
  error,
  data: response,
} = useFetch(url, { refetch: true }).get().json<SalesListResponse>();

const { isLoading } = useNProgress();
watch(isFetching, (value) => {
  isLoading.value = value;
});

const totalPriceMin = ref(0);
const totalPriceMax = ref(0);

const totalPriceRangeQuery = useRouteQuery<string | null>("price-range", null);
const totalPriceRange = computed<[number, number]>({
  get() {
    if (totalPriceRangeQuery.value == null) {
      return [totalPriceMin.value, totalPriceMax.value];
    } else {
      return totalPriceRangeQuery.value
        .split(",")
        .map((rawValue) => Number.parseFloat(rawValue) || 0)
        .slice(0, 2) as [number, number];
    }
  },
  set(newRange) {
    totalPriceRangeQuery.value = `${newRange[0]},${newRange[1]}`;
  },
});

const partNames = ref<number[]>([]);
const partNamesFilter = ref<number[]>(filtersStore.partNamesFilter);

const regions = ref<string[]>([]);
const regionFilter = ref<string[]>(filtersStore.regionFilter);

const brands = ref<string[]>([]);
const brandFilter = ref<string[]>(filtersStore.brandFilter);

const categories = ref<string[]>([]);
const categoryFilter = ref<string[]>(filtersStore.categoryFilter);

watchEffect(() => {
  filtersStore.dateFrom = dateFrom.value;
  filtersStore.dateTo = dateTo.value;
  filtersStore.page = page.value;
  filtersStore.totalPriceRange = totalPriceRange.value;

  filtersStore.partNamesFilter = partNamesFilter.value;
  filtersStore.regionFilter = regionFilter.value;
  filtersStore.brandFilter = brandFilter.value;
  filtersStore.categoryFilter = categoryFilter.value;
});

watch(response, (newResponse) => {
  if (newResponse != null) {
    const totalPriceFilterWasMaxed =
      totalPriceRange.value[1] == totalPriceMax.value;

    totalPriceMin.value = 0;
    totalPriceMax.value = Math.max(
      Math.ceil(
        newResponse.data.reduce(
          (max, item) =>
            Math.max(max, Number.parseFloat(item.total_price) || 0),
          0
        )
      ),
      totalPriceMax.value
    );

    // Update filter to the new maximum value, if it wasn't changed by the user.
    if (totalPriceRange.value[1] == 0 || totalPriceFilterWasMaxed) {
      totalPriceRange.value[1] = totalPriceMax.value;
    }

    partNames.value = [
      ...new Set([
        ...newResponse.data.map((item) => item.nm_id),
        ...partNamesFilter.value,
      ]),
    ];

    regions.value = [
      ...new Set([
        ...newResponse.data.map((item) => item.region_name),
        ...regionFilter.value,
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
  }
});

const filteredData = computed(() => {
  if (response.value == null) {
    return [];
  }
  return response.value.data.filter(
    (item) =>
      totalPriceRange.value[0] <= Number.parseFloat(item.total_price) &&
      Number.parseFloat(item.total_price) <= totalPriceRange.value[1] &&
      (partNamesFilter.value.length == 0 ||
        partNamesFilter.value.includes(item.nm_id)) &&
      (regionFilter.value.length == 0 ||
        regionFilter.value.includes(item.region_name)) &&
      (brandFilter.value.length == 0 ||
        brandFilter.value.includes(item.brand)) &&
      (categoryFilter.value.length == 0 ||
        categoryFilter.value.includes(item.category))
  );
});

const chartData = computed(() => {
  const regions = [
    ...new Set(filteredData.value.map((item) => item.region_name)),
  ];
  const data = [];
  for (const region of regions) {
    const regionSum = filteredData.value.reduce(
      (sum, item) =>
        (item.region_name == region ? Number.parseFloat(item.total_price) : 0) +
        sum,
      0
    );
    data.push(regionSum);
  }

  return {
    labels: regions,
    datasets: [
      {
        data,
        label: "Полная сумма по региону",
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
});
</script>

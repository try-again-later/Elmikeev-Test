<template>
  <h1 class="mb-8">Заказы</h1>
  <v-row>
    <v-col cols="12" sm="6">
      <v-date-input label="Начиная с даты" v-model="dateFrom"></v-date-input>
    </v-col>
    <v-col cols="12" sm="6">
      <v-date-input label="Заканчивая датой" v-model="dateTo"></v-date-input>
    </v-col>
  </v-row>
  <v-sheet v-if="error != null" class="d-flex flex-column ga-4 align-center">
    <p>Ошибка при загрузке данных</p>
    <v-btn @click="execute">Попробовать ещё раз</v-btn>
  </v-sheet>
  <template v-if="response != null && error == null">
    <v-table fixed-header striped="even">
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
        <tr v-for="item in response.data">
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
        :length="response.meta.last_page"
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
</script>

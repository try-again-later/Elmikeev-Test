<template>
  <h1>Доходы</h1>
  <template v-if="response != null">
    <v-table fixed-header striped="even">
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
        <tr v-for="item in response.data">
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
        :length="response.meta.last_page"
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

const page = useRouteQuery("page", "1", { transform: Number });
const url = computed(
  () =>
    incomesListRequestUrl({
      // Last 10 days
      dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000 * 10),
      dateTo: new Date(),
      page: page.value,
      limit: 100,
    }).href
);

const { data: response } = useFetch(url, { refetch: true })
  .get()
  .json<IncomesListResponse>();
</script>

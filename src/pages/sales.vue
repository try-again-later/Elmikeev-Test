<template>
  <h1>Продажи</h1>
  <template v-if="response != null">
    <v-table fixed-header striped="even">
      <thead>
        <tr>
          <th>ID</th>
          <th>Штрих-код</th>
          <th>Дата</th>
          <th>Полная сумма</th>
          <th>Скидка</th>
          <th>Регион</th>
          <th>Склад</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in response.data">
          <td>{{ item.sale_id }}</td>
          <td>{{ item.barcode }}</td>
          <td>{{ item.date }}</td>
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
import { salesListRequestUrl, type SalesListResponse } from "@/api/sale/list";

const page = useRouteQuery("page", "1", { transform: Number });
const url = computed(
  () =>
    salesListRequestUrl({
      // Last 10 days
      dateFrom: new Date(Date.now() - (24 * 60 * 60 * 1000) * 10),
      dateTo: new Date(),
      page: page.value,
      limit: 100,
    }).href
);

const { data: response } = useFetch(url, { refetch: true })
  .get()
  .json<SalesListResponse>();
</script>

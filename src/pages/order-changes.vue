<template>
  <h1 class="mb-8">Изменения по показателю по заказам</h1>

  <v-sheet class="mb-2">Текущий период:</v-sheet>
  <v-row>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Начиная с даты"
        v-model="orders.currentPeriodDateFrom"
      ></v-date-input>
    </v-col>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Заканчивая датой"
        v-model="orders.currentPeriodDateTo"
      ></v-date-input>
    </v-col>
  </v-row>

  <v-sheet class="mb-2">Предыдущий период:</v-sheet>
  <v-row>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Начиная с даты"
        v-model="orders.previousPeriodDateFrom"
      ></v-date-input>
    </v-col>
    <v-col cols="12" sm="6">
      <v-date-input
        label="Заканчивая датой"
        v-model="orders.previousPeriodDateTo"
      ></v-date-input>
    </v-col>
  </v-row>

  <v-sheet class="mb-2">Фильтры:</v-sheet>
  <v-row>
    <v-col cols="12" sm="3">
      <v-select
        v-model="orders.partNamesFilter"
        :items="orders.allPartNames"
        label="Артикул"
        multiple
      ></v-select>
    </v-col>
    <v-col cols="12" sm="3">
      <v-select
        v-model="orders.categoryFilter"
        :items="orders.allCategories"
        label="Категория"
        multiple
      ></v-select>
    </v-col>
    <v-col cols="12" sm="3">
      <v-select
        v-model="orders.brandFilter"
        :items="orders.allBrands"
        label="Бренд"
        multiple
      ></v-select>
    </v-col>
    <v-col cols="12" sm="3">
      <v-select
        v-model="orders.regionFilter"
        :items="orders.allRegions"
        label="Регион"
        multiple
      ></v-select>
    </v-col>
  </v-row>

  <v-sheet v-if="orders.hasError" class="d-flex flex-column ga-4 align-center">
    <p>Ошибка при загрузке данных</p>
    <v-btn @click="orders.retry">Попробовать ещё раз</v-btn>
  </v-sheet>
  <template v-if="!orders.hasError">
    <template v-if="$route.params.type == 'sales'">
      <OrderSales :show-full-table="true" />
    </template>
    <template v-else-if="$route.params.type == 'prices'">
      <OrderPrices :show-full-table="true" />
    </template>
    <template v-else-if="$route.params.type == 'cancels'">
      <OrderCancels :show-full-table="true" />
    </template>
    <template v-else-if="$route.params.type == 'average-discounts'">
      <OrderAverageDiscounts :show-full-table="true" />
    </template>
  </template>
</template>

<script setup lang="ts">
import OrderSales from "@/components/order_changes/OrderSales.vue";
import OrderPrices from "@/components/order_changes/OrderPrices.vue";
import OrderCancels from "@/components/order_changes/OrderCancels.vue";
import OrderAverageDiscounts from "@/components/order_changes/OrderAverageDiscounts.vue";
import { useOrderPeriodChanges } from "@/stores/orderPeriodChanges";

const orders = useOrderPeriodChanges();
</script>

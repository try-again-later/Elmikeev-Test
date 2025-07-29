<template>
  <v-navigation-drawer v-model="drawerVisible" disable-resize-watcher>
    <v-list nav>
      <v-list-item
        v-for="item in navItems"
        :key="item.route"
        :title="item.title"
        :prepend-icon="item.icon"
        :to="{ path: item.route, query: item.query, replace: true }"
      />
    </v-list>
  </v-navigation-drawer>

  <v-app-bar :elevation="2">
    <v-container>
      <v-sheet class="d-flex align-center">
        <v-app-bar-nav-icon
          v-if="$vuetify.display.smAndDown"
          @click="drawerVisible = !drawerVisible"
        />

        <template v-if="$vuetify.display.mdAndUp">
          <v-btn
            v-for="item in navItems"
            :key="item.route"
            :text="item.title"
            :prepend-icon="item.icon"
            :to="{ path: item.route, query: item.query, replace: true }"
          />
        </template>

        <v-btn
          text="Github"
          prepend-icon="mdi-xml"
          href="https://github.com/try-again-later/Elmikeev-Test"
          class="ml-auto"
        />
      </v-sheet>
    </v-container>
  </v-app-bar>

  <v-main>
    <v-container>
      <router-view />
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { format as dateFormat } from "date-fns";

import { useSaleFiltersStore } from "@/stores/saleFilters";
import { useOrderFiltersStore } from "@/stores/orderFilters";
import { useStockFiltersStore } from "@/stores/stockFilters";
import { useIncomeFiltersStore } from "@/stores/incomeFilters";

const DATE_FORMAT = "yyyy-MM-dd";

const drawerVisible = ref(false);

const navItems = [
  {
    title: "Продажи",
    route: "sales",
    icon: "mdi-cash-plus",
    get query() {
      const { dateFrom, dateTo, page, totalPriceRange } = storeToRefs(
        useSaleFiltersStore()
      );

      const query: Record<string, string> = {};
      if (dateFrom.value != null) {
        query.dateFrom = dateFormat(dateFrom.value, DATE_FORMAT);
      }
      if (dateTo.value != null) {
        query.dateTo = dateFormat(dateTo.value, DATE_FORMAT);
      }
      if (page.value != null || page.value == 1) {
        query.page = page.value.toString();
      }
      if (totalPriceRange.value != null) {
        query[
          "price-range"
        ] = `${totalPriceRange.value[0]},${totalPriceRange.value[1]}`;
      }

      return query;
    },
  },
  {
    title: "Заказы",
    route: "orders",
    icon: "mdi-cart",
    get query() {
      const { dateFrom, dateTo, page, warehouseNamesFilter } = storeToRefs(
        useOrderFiltersStore()
      );

      const query: Record<string, string> = {};
      if (dateFrom.value != null) {
        query.dateFrom = dateFormat(dateFrom.value, DATE_FORMAT);
      }
      if (dateTo.value != null) {
        query.dateTo = dateFormat(dateTo.value, DATE_FORMAT);
      }
      if (page.value != null || page.value == 1) {
        query.page = page.value.toString();
      }
      if (warehouseNamesFilter.value != null) {
        query.warehouses = warehouseNamesFilter.value.join(",");
      }

      return query;
    },
  },
  {
    title: "Склады",
    route: "stocks",
    icon: "mdi-warehouse",
    get query() {
      const { page, inWayFromClient, inWayToClient } = storeToRefs(
        useStockFiltersStore()
      );

      const query: Record<string, string> = {};
      if (page.value != null || page.value == 1) {
        query.page = page.value.toString();
      }
      query["in-way-from-client"] = inWayFromClient.value;
      query["in-way-to-client"] = inWayToClient.value;

      return query;
    },
  },
  {
    title: "Доходы",
    route: "incomes",
    icon: "mdi-hand-coin",
    get query() {
      const { dateFrom, dateTo, page, quantityRange } = storeToRefs(
        useIncomeFiltersStore()
      );

      const query: Record<string, string> = {};
      if (dateFrom.value != null) {
        query.dateFrom = dateFormat(dateFrom.value, DATE_FORMAT);
      }
      if (dateTo.value != null) {
        query.dateTo = dateFormat(dateTo.value, DATE_FORMAT);
      }
      if (page.value != null || page.value == 1) {
        query.page = page.value.toString();
      }
      if (quantityRange.value != null) {
        query[
          "quantity-range"
        ] = `${quantityRange.value[0]},${quantityRange.value[1]}`;
      }

      return query;
    },
  },
];
</script>

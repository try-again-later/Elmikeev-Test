<template>
  <h1 class="mb-8">Главная</h1>
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
    <v-row>
      <v-col cols="12" sm="6" class="position-relative">
        <v-expansion-panels v-model="salesPanel">
          <v-expansion-panel
            title="Количество продаж по каждому артикулу"
            value="sales"
          >
            <v-expansion-panel-text>
              <OrderSales :show-full-table="false" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col cols="12" sm="6" class="position-relative">
        <v-expansion-panels v-model="totalPricesPanel">
          <v-expansion-panel
            title="Суммарная стоимость продаж по каждому артикулу"
            value="totalPrices"
          >
            <v-expansion-panel-text>
              <OrderPrices :show-full-table="false" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6" class="position-relative">
        <v-expansion-panels v-model="cancelsPanel">
          <v-expansion-panel
            title="Количество отмен по каждому артикулу"
            value="cancels"
          >
            <v-expansion-panel-text>
              <OrderCancels :show-full-table="false" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col cols="12" sm="6" class="position-relative">
        <v-expansion-panels v-model="averageDiscountsPanel">
          <v-expansion-panel
            title="Средняя скидка по каждому артикулу"
            value="averageDiscounts"
          >
            <v-expansion-panel-text>
              <OrderAverageDiscounts :show-full-table="false" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </template>
</template>

<script setup lang="ts">
import { useNProgress } from "@vueuse/integrations/useNProgress";

import OrderSales from "@/components/order_changes/OrderSales.vue";
import OrderPrices from "@/components/order_changes/OrderPrices.vue";
import OrderCancels from "@/components/order_changes/OrderCancels.vue";
import OrderAverageDiscounts from "@/components/order_changes/OrderAverageDiscounts.vue";

import { useOrderPeriodChanges } from "@/stores/orderPeriodChanges";

const salesPanel = ref(["sales"]);
const totalPricesPanel = ref(["totalPrices"]);
const cancelsPanel = ref(["cancels"]);
const averageDiscountsPanel = ref(["averageDiscounts"]);

const orders = useOrderPeriodChanges();

// Loading bar

const { isLoading } = useNProgress();
watchEffect(() => {
  isLoading.value = orders.isFetching;
});
</script>

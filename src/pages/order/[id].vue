<template>
  <h1 class="mb-8">Информация по заказам с артикулом {{ route.params.id }}</h1>

  <v-row>
    <v-col cols="12" md="4">
      <v-img src="/stub.png" cover max-height="250" class="mb-8"></v-img>
      <v-alert
        v-if="!orders.isFetching && order == null"
        density="compact"
        text="Артикул не найден"
        title="Ошибка"
        type="warning"
      ></v-alert>
      <template v-else-if="order != null">
        <v-data-table
          :items="orderData"
          hide-default-footer
          hide-default-header
        ></v-data-table>
      </template>
    </v-col>
    <v-col cols="12" md="8">
      <v-table>
        <thead>
          <tr>
            <th>Показатель</th>
            <th>Начало</th>
            <th>Конец</th>
            <th>Значение</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in orderPeriodData">
            <td>{{ item.name }}</td>
            <td>{{ dateFormat(item.dateFrom, DATE_FORMAT) }}</td>
            <td>{{ dateFormat(item.dateTo, DATE_FORMAT) }}</td>
            <td>{{ item.value }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { format as dateFormat } from "date-fns";
import { useNProgress } from "@vueuse/integrations/useNProgress.mjs";
import { useOrderPeriodChanges } from "@/stores/orderPeriodChanges";
import orderCountPerPartName from "@/data/orderCountPerPartName";
import orderTotalPricePerPartName from "@/data/orderTotalPricePerPartName";
import orderCancelCountPerPartName from "@/data/orderCancelCountPerPartName";
import orderAverageDiscountPerPartName from "@/data/orderAverageDiscountPerPartName";

const DATE_FORMAT = "yyyy-MM-dd";

const route = useRoute("/order/[id]");

const orders = useOrderPeriodChanges();

const { isLoading } = useNProgress();
watchEffect(() => {
  isLoading.value = orders.isFetching;
});

const order = computed(() => {
  return orders.getOrder(Number.parseInt(route.params.id) || 0);
});
const orderData = computed(() => {
  if (order.value == null) {
    return [];
  } else {
    return Object.keys(order.value).map((key) => ({
      key,
      value: (order.value as Record<string, any>)[key],
    }));
  }
});

const orderPeriodData = computed(() => {
  if (order.value == null) {
    return [];
  }

  const data: Array<{
    name: string;
    dateFrom: Date;
    dateTo: Date;
    value: number | string;
  }> = [];

  const salesData = orderCountPerPartName(orders.currentPeriodOrders);
  let salesCount =
    salesData.find((entry) => entry.partName == order.value?.nm_id)?.count ?? 0;
  data.push({
    name: "Количество продаж",
    dateFrom: orders.currentPeriodDateFrom,
    dateTo: orders.currentPeriodDateTo,
    value: salesCount,
  });

  const totalPriceData = orderTotalPricePerPartName(orders.currentPeriodOrders);
  let totalPrice =
    totalPriceData.find((entry) => entry.partName == order.value?.nm_id)
      ?.totalPrice ?? 0;
  data.push({
    name: "Суммарная стоимость продаж",
    dateFrom: orders.currentPeriodDateFrom,
    dateTo: orders.currentPeriodDateTo,
    value: totalPrice.toFixed(2),
  });

  const cancelCountData = orderCancelCountPerPartName(
    orders.currentPeriodOrders
  );
  let cancelCount =
    cancelCountData.find((entry) => entry.partName == order.value?.nm_id)
      ?.cancelCount ?? 0;
  data.push({
    name: "Количество отмен",
    dateFrom: orders.currentPeriodDateFrom,
    dateTo: orders.currentPeriodDateTo,
    value: cancelCount,
  });

  const averageDiscountData = orderAverageDiscountPerPartName(
    orders.currentPeriodOrders
  );
  let averageDiscount =
    averageDiscountData.find((entry) => entry.partName == order.value?.nm_id)
      ?.averageDiscount ?? 0;
  data.push({
    name: "Средняя скидка",
    dateFrom: orders.currentPeriodDateFrom,
    dateTo: orders.currentPeriodDateTo,
    value: averageDiscount.toFixed(2),
  });

  return data;
});
</script>

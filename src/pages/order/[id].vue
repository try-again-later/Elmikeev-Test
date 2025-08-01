<template>
  <h1 class="mb-8">Информация по заказам с артикулом {{ route.params.id }}</h1>
</template>

<script setup lang="ts">
const route = useRoute("/order/[id]");
</script>

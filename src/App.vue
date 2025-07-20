<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
const requestOptions = {
  method: 'GET',
  redirect: 'follow',
} as const;

const requestUrl = new URL(`${import.meta.env.VITE_API_URL}/api/incomes`);
requestUrl.searchParams.append('dateFrom', '2025-07-17');
requestUrl.searchParams.append('dateTo', '2025-07-24');
requestUrl.searchParams.append('page', '1');
requestUrl.searchParams.append('limit', '100');
requestUrl.searchParams.append('key', import.meta.env.VITE_API_KEY);

fetch(requestUrl.href, requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
</script>

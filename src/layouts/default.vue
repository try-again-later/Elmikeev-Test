<template>
  <v-navigation-drawer v-model="drawerVisible" disable-resize-watcher>
    <v-list nav>
      <v-list-item
        v-for="item in navItems"
        :key="item.route"
        :title="item.title"
        :prepend-icon="item.icon"
        :to="item.route"
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
            :to="item.route"
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
import { ref } from 'vue';

const drawerVisible = ref(false);

const navItems = [
  {
    title: 'Продажи',
    route: 'sales',
    icon: 'mdi-cash-plus',
  },
  {
    title: 'Заказы',
    route: 'orders',
    icon: 'mdi-cart',
  },
  {
    title: 'Склады',
    route: 'stocks',
    icon: 'mdi-warehouse',
  },
  {
    title: 'Доходы',
    route: 'incomes',
    icon: 'mdi-hand-coin',
  },
];
</script>

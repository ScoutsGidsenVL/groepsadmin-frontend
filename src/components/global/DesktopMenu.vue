<template>
  <div class="menu-items d-flex flex-row ml-3">
    <div v-for="menuItem in menuItems" :key="menuItem.label">
      <div
        v-if="menuItem.condition"
        class="menu-item mr-4 clickable"
        @click="goto(menuItem)"
      >
        <i
          :class="menuItem.icon"
          class="menu-icon"
          :title="menuItem.label.toLowerCase()"
        />
        <span
          class="menu-item-text"
          :class="
            activeMenu.toLowerCase() === menuItem.label.toLowerCase()
              ? 'active'
              : ''
          "
          >{{ menuItem.label }}</span
        >
      </div>
    </div>
  </div>
</template>

<script>
import WikiService from "@/services/wiki/WikiService";

export default {
  name: "DesktopMenu",
  data() {
    return {
      activeMenu: "",
      menuItems: [
        {
          label: "Ledenlijst",
          condition: true,
          icon: "fas fa-users",
          link: "Ledenlijst",
        },
        {
          label: "Ledenaantallen",
          condition: true,
          icon: "fas fa-chart-area",
          link: "Ledenaantallen",
        },
        {
          label: "Groepsinstellingen",
          condition: true,
          icon: "fas fa-cogs",
          link: "Groepsinstellingen",
        },
        {
          label: "Profiel",
          condition: true,
          icon: "fas fa-user",
          link: "Profiel",
        },
        {
          label: "Lidaanvragen",
          condition: true,
          icon: "far fa-address-book",
          link: "Aanvragen",
        },
      ],
    };
  },
  methods: {
    goto(menuItem) {
      top.window.onbeforeunload = null;
      if (menuItem.link === "Profiel") {
        this.$router.push({ name: "Lid", params: { id: "profiel" } });
      } else {
        this.$router.push({ name: menuItem.link });
      }
      this.activeMenu = menuItem.label;
    },
  },
  // In geval van refresh gaan we huidige pagina ophalen om actieve menu aan te duiden
  mounted() {
    this.activeMenu = WikiService.getPagina();
  },
};
</script>

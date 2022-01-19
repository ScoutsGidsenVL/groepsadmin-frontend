<template>
  <div class="mobile-margin">
    <span @click="toggleMenu">
      <button type="button" class="btn btn-primary">
        <i class="fa fa-bars"></i>&nbsp; Menu
      </button>
      <ul class="dropdown-menu" v-show="toggle">
        <li
          v-for="menuItem in menuItems"
          :key="menuItem.label"
          v-show="menuItem.condition"
          :class="
            activeMenu.toLowerCase() === menuItem.label.toLowerCase()
              ? 'active'
              : ''
          "
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
        </li>
      </ul>
    </span>
  </div>
</template>
<script>
import WikiService from "@/services/wiki/WikiService";

export default {
  name: "MobileMenu",
  data() {
    return {
      activeMenu: "",
      toggle: false,
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
          label: "Mijn gegevens",
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
    toggleMenu() {
      this.toggle = !this.toggle;
    },
    goto(menuItem) {
      if (menuItem.link === "Profiel") {
        this.$router.push({ name: "Lid", params: { id: "profiel" } });
      }
      this.activeMenu = menuItem.label;
      this.$router.push({ name: menuItem.link });
    },
  },
  // In geval van refresh gaan we huidige pagina ophalen om actieve menu aan te duiden
  mounted() {
    this.activeMenu = WikiService.getPagina();
  },
};
</script>

<style scoped></style>

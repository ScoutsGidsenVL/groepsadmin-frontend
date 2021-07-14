<template>
  <div class="menubalk">
    <img src="@/static/img/bg-texture.jpg" alt="background" class="background" />
    <div class="row item-menu mr-1">
      <div class="ga-logo clickable" @click="goToDashBoard">
        <img src="/static/img/ga-logo.svg" alt="ga logo" />
      </div>
      <desktop-menu />
      <mobile-menu class="p-hidden" />
      <lid-zoek-auto-complete></lid-zoek-auto-complete>
    </div>
  </div>
</template>

<script>
import LidZoekAutoComplete from "@/components/global/LidZoekAutoComplete";
import DesktopMenu from "@/components/global/DesktopMenu";
import MobileMenu from "@/components/global/MobileMenu";

export default {
  name: "Menubalk",
  components: {
    MobileMenu,
    DesktopMenu,
    LidZoekAutoComplete,
  },
  methods: {
    goToDashBoard() {
      this.$router.push({ name: "Dashboard" });
    },
  },
};
</script>

<style scoped></style>

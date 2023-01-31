<template>
  <div class="custom-block cursor-pointer" v-if="visible && title !== 'Leden zoeken'" @click="goto(link)">
    <div class="text-align-left text-xl pl-3 pt-3 cut-off-text">
      <label>{{ title }}</label>
    </div>
    <div class="block-icon d-flex justify-content-end xl:pr-4 ">
      <i :class="icoon" class="menu-icon-block" :title="title.toLowerCase()"/>
    </div>
  </div>
  <div class="custom-block-zoeken" v-if="visible && title === 'Leden zoeken'">
    <div class="text-align-left text-xl pl-3 pt-3 cut-off-text">
      <label>{{ title }}</label>
    </div>
    <div class="block-icon d-flex justify-content-between xl:pr-4 ">
      <lid-zoek-auto-complete :sectie="'ledenlijst'"></lid-zoek-auto-complete>
      <i :class="icoon" class="menu-icon-block" :title="title.toLowerCase()"/>
    </div>

  </div>
</template>

<script>
import DashboardService from "@/services/dashboard/DashboardService";
import LidZoekAutoComplete from "@/components/global/LidZoekAutoComplete";

export default {
  name: "DashboardBlock",
  components: {LidZoekAutoComplete},
  props: {
    title: {
      type: String
    },
    icoon: {
      type: String
    },
    link: {
      type: String
    },
    visible: {
      type: Boolean,
      default: false
    },
    internal: {
      type: Boolean
    }
  },
  setup(props) {
    const {
      goto
    } = DashboardService.dashBoardBlockSpace(props);

    return {
      goto
    }
  }
}
</script>

<style scoped>

</style>

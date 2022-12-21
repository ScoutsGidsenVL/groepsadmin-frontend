<template>
  <div class="custom-block clickable" v-if="visible" @click="goto(link)">
    <div class="block-label pl-3 pt-3 cut-off-text">
      <label>{{ title }}</label>
    </div>
    <div class="block-icon d-flex justify-content-end xl:pr-4 ">
      <i :class="icoon" class="menu-icon-block" :title="title.toLowerCase()"/>
    </div>
  </div>
</template>

<script>
import DashboardService from "@/services/dashboard/DashboardService";

export default {
  name: "DashboardBlock",
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

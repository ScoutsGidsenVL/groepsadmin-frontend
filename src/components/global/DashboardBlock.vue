<template>
  <div class="custom-block clickable" v-if="visible" @click="goto(link)">
    <div class="block-label pl-3 pt-3">
      <label>{{ title }}</label>
    </div>
    <div class="block-icon d-flex justify-content-end pr-4">
      <i :class="icoon" class="menu-icon-block" :title="title.toLowerCase()"/>
    </div>
  </div>
</template>

<script>
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
  methods: {
    goto(link) {
      top.window.onbeforeunload = null;
      if (!this.internal) {
        window.location.href = link;
      } else {
        if (link === "Profiel") {
          this.$router.push({name: "Lid", params: {id: "profiel"}});
        } else if (link === "IndividueleSteekkaart") {
          this.$router.push({name: link, params: {id: this.$store.getters.profiel.id }});
        } else {
          this.$router.push({name: link});
        }
        this.activeMenu = this.title;
      }
    },
  }
}
</script>

<style scoped>

</style>
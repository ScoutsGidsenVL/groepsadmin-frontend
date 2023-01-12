<template>
  <div class="col-12 col-sm-6 col-lg-3 col-xl-2 cursor-pointer" v-click-outside="closeMenu">
    <div @click="toggleMenu = !toggleMenu"
         class="clickable col-12 kolom-select text-align-left type-select-button align-items-center d-flex">
      <i class="fa fa-plus"></i><label class="ml-2 cursor-pointer line-height-1">Nieuw Criterium</label>
    </div>
    <div v-show="toggleMenu" class="position-absolute z999 bg-white col-6 col-md-4 col-lg-3 filter-border">
      <div v-for="(criterium, key) in criteria" :key="key">
        <div class="text-align-left cursor-pointer p-2 filter-criteria-select-item" @click="activateCriterium(criterium)">
          <label class="text-align-left cursor-pointer">{{ criterium.title }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CriteriaSelect",
  props: {
    criteria: {
      type: Array
    }
  },
  data() {
    return {
      toggleMenu: false,
    }
  },
  methods: {
    activateCriterium(criterium) {
      this.$emit('activateCriterium', criterium);
      this.toggleMenu = false;
    },
    closeMenu() {
      this.toggleMenu = false;
    }
  }
}
</script>

<style scoped>

</style>

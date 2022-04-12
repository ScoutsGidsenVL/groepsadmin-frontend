<template>
  <div class="col-lg-2 ">
    <div @click="toggleMenu = !toggleMenu" class="clickable btn-primary col-12 kolom-select text-align-left">Kolommen</div>
    <div v-show="toggleMenu" class="position-absolute z999 bg-white col-2 mt-2 filter-border">
      <div v-for="(item, key) in actieveKolommen" :key="key">
        <base-checkbox :label="item.header" class="text-align-left" @check="voegKolomToe"></base-checkbox>
      </div>
    </div>
  </div>
</template>

<script>


import BaseCheckBoxLeft from "@/components/input/BaseCheckboxLeft";
export default {
  name: "KolommenSelect",
  props: {
    actieveKolommen: {
      type: Array
    }
  },
  components: {
    baseCheckbox: BaseCheckBoxLeft
  },
  data() {
    return {
      toggleMenu: false,
      geselecteerdeKolommen: null,
    }
  },
  mounted() {

  },
  methods: {
    voegKolomToe() {

    }
  }
}
</script>

<style scoped>

</style>
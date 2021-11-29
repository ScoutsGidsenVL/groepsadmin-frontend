<template>
  <div class="col-lg-2 ">
    <div @click="toggle" class="clickable btn-primary col-12 kolom-select text-align-left">Kolommen</div>
    <div v-show="toggleMenu" class="position-absolute z999 bg-white col-12 mt-2">
      <div v-for="(item, key) in actieveKolommen" :key="key">
        <base-checkbox :label="item.header" class="text-align-left"></base-checkbox>
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
      groupedCities: [{
        label: 'Germany', code: 'DE',
        items: [
          {label: 'Berlin', value: 'Berlin'},
          {label: 'Frankfurt', value: 'Frankfurt'},
          {label: 'Hamburg', value: 'Hamburg'},
          {label: 'Munich', value: 'Munich'}
        ]
      },
        {
          label: 'USA', code: 'US',
          items: [
            {label: 'Chicago', value: 'Chicago'},
            {label: 'Los Angeles', value: 'Los Angeles'},
            {label: 'New York', value: 'New York'},
            {label: 'San Francisco', value: 'San Francisco'}
          ]
        },
        {
          label: 'Japan', code: 'JP',
          items: [
            {label: 'Kyoto', value: 'Kyoto'},
            {label: 'Osaka', value: 'Osaka'},
            {label: 'Tokyo', value: 'Tokyo'},
            {label: 'Yokohama', value: 'Yokohama'}
          ]
        }]
    }
  },
  mounted() {

  },
  methods: {
    toggle() {
      this.toggleMenu = !this.toggleMenu;
    }
  }
}
</script>

<style scoped>

</style>
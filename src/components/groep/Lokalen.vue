<template>
  <div class="lokalen-card ml-4 mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> {{ title }}</span>
        </div>
      </template>
      <template #content>
        <adressen v-model="geselecteerdeGroep" @showMarker="toonMarker" class="mb-5"></adressen>
        <google-maps :groep="geselecteerdeGroep" :zichtbareMarker="zichtbareMarker" class="mt-3"/>
      </template>
    </card>
  </div>
</template>

<script>
import GoogleMaps from "@/components/groep/GoogleMaps";
import Adressen from "@/components/groep/Adressen";

export default {
  name: "Lokalen",
  components: {
    Adressen,
    GoogleMaps
  },
  data() {
    return {
      zichtbareMarker: ''
    }
  },
  props: {
    title: {
      type: String
    },
    groep: {
      type: Object
    }
  },
  methods:{
    toonMarker(index) {
      this.zichtbareMarker = index;
    }
  },
  computed: {
    geselecteerdeGroep() {
      return this.groep;
    }
  }
}
</script>

<style scoped>

</style>
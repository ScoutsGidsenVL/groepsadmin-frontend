<template>
  <GMapMap
    :key="key"
    style="width: 100%; height: 500px"
    :center="centerPoint"
    :zoom="15"
  >
    <GMapMarker
      v-for="(m, index) in markers"
      :options="m"
      :key="index"
      :clickable="true"
      @click="openWindow(index, m)"
    >
    </GMapMarker>

    <GMapInfoWindow
      ref="infoWindow"
      :options="{
        maxWidth: 300,
        pixelOffset: {
          width: 0,
          height: -45,
        },
      }"
      :position="infoWindow.position"
      :opened="infoWindow.open"
      @closeclick="close"
      @click="close"
    >
      <p v-html="infoWindow.template"></p>
    </GMapInfoWindow>
  </GMapMap>
</template>
<script>
import { defineComponent } from "vue";
import GoogleMaps from "@/services/google/GoogleMaps";

export default defineComponent({
  name: "GoogleMaps",
  props: {
    groep: {
      type: Object,
    },
    zichtbareMarker: {
      type: [String, Number],
    },
  },
  data() {
    return {
      key: GoogleMaps.getKey(),
      windowOpen: false,
      infoWindow: {
        position: { lat: 0, lng: 0 },
        open: false,
        template: "",
      },
    };
  },
  methods: {
    openWindow(index, marker) {
      this.infoWindow.position = marker.position;
      this.infoWindow.template = marker.infoProp;
      this.infoWindow.open = true;
    },
    close() {
      this.infoWindow.open = false;
    },
  },
  created() {
    this.$watch("zichtbareMarker", () => {
      this.openWindow(this.zichtbareMarker, this.markers[this.zichtbareMarker]);
    });
  },
  computed: {
    geselecteerdeGroep() {
      return this.groep;
    },
    centerPoint() {
      return GoogleMaps.berekenCenter(this.geselecteerdeGroep.adressen);
    },
    markers() {
      return GoogleMaps.bepaalMarkers(this.geselecteerdeGroep.adressen);
    },
  },
});
</script>

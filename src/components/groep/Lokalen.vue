<template>
  <div class="lokalen-card lg:ml-4 mb-4">
        <adressen
          v-model="geselecteerdeGroep"
          @showMarker="toonMarker"
          :bewerkbaar="kanGroepWijzigen"
          title="Lokalen"
          class="mb-5"
        ></adressen>
        <google-maps
          :groep="geselecteerdeGroep"
          :zichtbareMarker="zichtbareMarker"
          class="mt-3"
        />
  </div>
</template>

<script>
import GoogleMaps from "@/components/groep/GoogleMaps";
import Adressen from "@/components/groep/Adressen";
import LokalenService from "@/services/groep/LokalenService";
import {toRefs} from "@vue/reactivity";

export default {
  name: "Lokalen",
  components: {
    Adressen,
    GoogleMaps,
  },
  props: {
    groep: {
      type: Object,
    },
    kanGroepWijzigen: {
      type: Boolean
    }
  },
  setup(props) {
    const {
      state,
      toonMarker,
      geselecteerdeGroep,
      heeftToegang,
      voegAdresToe
    } = LokalenService.lokalenSpace(props);

    return {
      ...toRefs(state),
      toonMarker,
      geselecteerdeGroep,
      heeftToegang,
      voegAdresToe
    }
  }
};
</script>

<style scoped></style>

<template>
  <div class="lokalen-card lg:ml-4 mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> Lokalen</span>
          <Button
            icon="pi pi-plus"
            class="p-button-rounded p-button-outlined mt-1 add-button"
            @click="voegAdresToe"
            title="Voeg adres toe"
            v-if="kanGroepWijzigen"
          />
        </div>
      </template>
      <template #content>
        <adressen
          v-model="geselecteerdeGroep"
          @showMarker="toonMarker"
          :bewerkbaar="kanGroepWijzigen"
          class="mb-5"
        ></adressen>
        <google-maps
          :groep="geselecteerdeGroep"
          :zichtbareMarker="zichtbareMarker"
          class="mt-3"
        />
      </template>
    </card>
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

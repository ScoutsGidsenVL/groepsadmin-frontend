<template>
  <div class="bovenbalk h-auto">
    <div class="row">
      <div v-if="(kanOpslaan || kanNieuwLidAanmaken) && gevuldeLedenLijst" :class="kanOpslaan || kanNieuwLidAanmaken ? 'col-12' : 'col-5 col-sm-4'">
        <div  class="flex justify-content-end">
          <opslaan class="md:ml-2" :disabled="!changes" @click="$emit('opslaan')"></opslaan>
        </div>
      </div>
      <div class="col-7 col-sm-8">
        <div class="d-flex justify-content-between">
          <div class="lg:ml-4" v-if="!nieuwLid">
            <label class="lg:ml-0 font15">{{ volledigeNaam }}</label>
          </div>
        </div>
        <div class="d-flex justify-content-start mt--05" v-if="!nieuwLid">
          <label class="mt-2 lg:ml-4 font15">Lidnr.: {{ lid.verbondsgegevens.lidnummer }}</label>
        </div>
      </div>
      <div class="col-5 col-sm-4" v-if="!nieuwLid && gevuldeLedenLijst">
        <div class="d-flex justify-content-end">
          <div class="navigate-buttons">
            <Button type="button" icon="pi pi-step-backward-alt" @click="vorigLid" title="vorig lid"
                    class="actie-button"/>
            <Button type="button" icon="pi pi-step-forward-alt" @click="volgendLid" class="ml-2 actie-button"
                    title="volgend lid"/>
          </div>
        </div>
      </div>
      <div v-if="(kanOpslaan || kanNieuwLidAanmaken) && !gevuldeLedenLijst" class="col-5 col-sm-4">
        <div  class="flex justify-content-end">
          <opslaan class="md:ml-2" :disabled="!changes" @click="$emit('opslaan')"></opslaan>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import Opslaan from "@/components/buttons/Opslaan";
import LidBovenBalkService from "@/services/lid/LidBovenBalkService";
import {toRefs} from "@vue/reactivity";

export default {
  name: "LidBovenBalk",
  components: {Opslaan},
  props: {
    modelValue: {
      type: Object,
    },
    eigenProfiel: {
      type: Boolean
    },
    changes: {
      type: Boolean
    },
    nieuwLid: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const {
      state,
      menu,
      toggle,
      gaNaar,
      gevuldeLedenLijst,
      kanOpslaan,
      kanNieuwLidAanmaken,
      volledigeNaam,
      volgendLid,
      vorigLid
    } = LidBovenBalkService.lidBovenBalkSpace(props);

    return {
      ...toRefs(state),
      menu,
      toggle,
      gaNaar,
      gevuldeLedenLijst,
      kanOpslaan,
      kanNieuwLidAanmaken,
      volledigeNaam,
      volgendLid,
      vorigLid
    }
  },
};
</script>

<style scoped></style>

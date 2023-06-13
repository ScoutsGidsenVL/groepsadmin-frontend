<template>
  <div class="bovenbalk h-auto">
    <div class="row">

      <div class="col-12" v-if="!nieuwLid && gevuldeLedenLijst && !eigenProfiel">
        <div class="d-flex justify-content-end">
          <div class="navigate-buttons">
            <Button type="button" icon="pi pi-step-backward-alt" @click="vorigLid" title="vorig lid"
                    class="actie-button"/>
            <Button type="button" icon="pi pi-step-forward-alt" @click="volgendLid" class="ml-2 actie-button"
                    title="volgend lid"/>
          </div>
        </div>
      </div>

      <div class="col-6 col-sm-8 flex align-self-end flex-column">
        <div class="d-flex justify-content-start ">
          <div class="lg:ml-4 " v-if="!nieuwLid">
            <label class="lg:ml-0 text-sm">{{ volledigeNaam }}</label>
          </div>
        </div>
        <div class="d-flex justify-content-start mt--05 text-align-left" v-if="!nieuwLid">
          <label class="mt-2 lg:ml-4 text-sm">Lidnr.: {{ lid.verbondsgegevens.lidnummer }}</label>
        </div>
      </div>


      <div v-if="gevuldeLedenLijst && !eigenProfiel"
           :class="!gevuldeLedenLijst ? 'col-12' : 'col-6 col-sm-4'">
        <div class="flex justify-content-end">
          <Button type="button" @click="toggle" aria-haspopup="true" v-if="filteredMenuItems.length > 0"
                  aria-controls="overlay_menu"
                  class="actie-button">
            <i class="pi pi-bars"></i>
            <span class="px-3">Acties</span>
            <i class="pi pi-chevron-down"></i>
          </Button>
          <Menu id="overlay_menu" ref="menu" :model="filteredMenuItems" :popup="true" class="sub-menu-items p-4">
            <template #item="{item}">
              <div @click="gaNaar(item.link)">
                <i :class="item.icon" class="lid-menu-item mr-2"><label
                  class="cursor-pointer lid-menu-item font ml-2">{{ item.label }}</label></i>
              </div>
            </template>
          </Menu>
          <opslaan class="ml-2" :disabled="!changes" @click="$emit('opslaan')" v-if="kanOpslaan || kanNieuwLidAanmaken"></opslaan>
        </div>
      </div>




      <div v-if="!gevuldeLedenLijst || eigenProfiel" class="col-6 col-sm-4">
        <div class="flex justify-content-end mb-2">
          <opslaan class="md:ml-2" :disabled="!changes" @click="$emit('opslaan')"
                   v-if="(kanOpslaan || kanNieuwLidAanmaken)"></opslaan>
        </div>
        <div class="flex justify-content-end">
          <Button type="button" @click="toggle" aria-haspopup="true"
                  aria-controls="overlay_menu"
                  class="actie-button">
            <i class="pi pi-bars"></i>
            <span class="px-3">Acties</span>
            <i class="pi pi-chevron-down"></i>
          </Button>
          <Menu id="overlay_menu" ref="menu" :model="filteredMenuItems" :popup="true" class="sub-menu-items p-4"
                v-if="filteredMenuItems.length > 0">
            <template #item="{item}">
              <div @click="gaNaar(item.link)">
                <i :class="item.icon" class="lid-menu-item mr-2"><label
                  class="cursor-pointer lid-menu-item font ml-2">{{ item.label }}</label></i>
              </div>
            </template>
          </Menu>
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
  setup(props, context) {
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
    } = LidBovenBalkService.lidBovenBalkSpace(props, context);

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

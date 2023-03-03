<template>
  <div class="bovenbalk" :class="!nieuwLid ? 'mt--1' : 'mb-4'">
    <div class="row">
      <div class="col-md-8">
        <div class="d-flex justify-content-between">
          <div class="lg:ml-4" v-if="!nieuwLid">
            <h4 class="mt-4 lg:ml-0">{{ volledigeNaam }}</h4>
          </div>
        </div>
        <div class="d-flex justify-content-start mt--05" v-if="!nieuwLid">
          <h6 class="mt-2 lg:ml-4">Lidnr.: {{ lid.verbondsgegevens.lidnummer }}</h6>
        </div>
      </div>
      <div class="col-md-4">
        <div class="row mt-4">
          <div class="col-6 col-md-12">
            <div class="d-flex sm:justify-content-start md:justify-content-end">
              <div :class="!nieuwLid ? 'mr-7' : ''" v-if="kanOpslaan || kanNieuwLidAanmaken">
                <opslaan class="md:ml-2" :disabled="!changes" @click="$emit('opslaan')"></opslaan>
              </div>
              <div class="mb-6 relative d-flex justify-content-end align-content-center mt--15" v-if="!nieuwLid">
                <Button type="button" icon="pi pi-bars" @click="toggle" aria-haspopup="true"
                        aria-controls="overlay_menu"
                        class="sub-menu-button menu-button p-button-rounded"/>
                <Menu id="overlay_menu" ref="menu" :model="filteredMenuItems" :popup="true" class="sub-menu-items p-4">
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
          <div class="col-6 col-md-12 mt--05" v-if="!nieuwLid">
            <div class="d-flex justify-content-end">

              <div class="navigate-buttons mt-2">
                <Button type="button" icon="pi pi-step-backward-alt" @click="vorigLid" title="vorig lid"
                        class="actie-button" v-if="legeLedenLijst"/>
                <Button type="button" icon="pi pi-step-forward-alt" @click="volgendLid" class="ml-2 actie-button"
                        title="volgend lid" v-if="legeLedenLijst"/>
              </div>
            </div>
          </div>
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
      legeLedenLijst,
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
      legeLedenLijst,
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

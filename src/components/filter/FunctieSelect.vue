<template>
  <div v-if="criteria && criteria.activated" v-click-outside="close">
    <div class="col-12 type-select-button kolom-select clickable" @click="toggleMenu = !toggleMenu">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left d-flex">
            <div>
              <label class="clickable">{{ criteria.title }}: </label>
            </div>
            <div class="row">
              <label class="subtitle clickable text-align-left criteria-label cut-off-text-filter">{{ label }}</label>
            </div>
          </div>
        </div>
        <div class="col-2">
          <verwijder-criteria :criteria="criteria"/>
        </div>
      </div>
    </div>
    <div
      class="position-absolute z999 bg-white col-12 col-sm-6 col-lg-3 col-xl-2 filter-border filter-height-select overflow-x-hidden"
      v-if="toggleMenu">
      <div class="d-flex align-content-start pt-2">
        <checkbox :binary="true" id="label" class="mr-2" v-model="allesGeselecteerd" @change="activeerAlleFuncties"/>
        <label class="text-align-left" for="label">Selecteer alle functies</label>
      </div>
      <divider></divider>
      <div v-for="(item, key) in criteria.itemgroups" :key="key" class="border-white border-solid border-1">
        <div class="d-flex align-content-start select-kolom-header pt-1 pb-1 pr-1 clickable">
          <checkbox :id="item.label" class="mr-2" v-model="selectedGroups" :value="item.label"
                    @change="activeerAlleGroepFuncties(item.label)"/>
          <label class="text-align-left vw90 clickable" @click="openSection(item.label)">{{ item.label }}</label>
          <div class="full-width d-flex justify-content-center" @click="openSection(item.label)">
            <i :class="opened(item.label) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
               class="text-white "
            />
          </div>
        </div>
        <div v-show="opened(item.label)">
          <div v-for="(functie, key2) in gesorteerdeFuncties(item.items)" :key="key2"
               class="d-flex align-content-start mt-1 ml-1">
            <checkbox :binary="true" :id="functie.label" class="mr-2 ml-1" v-model="functie.activated"
                      @change="activeerFunctie(functie)"/>
            <label class="text-align-left" :for="item.label">{{ functie.label }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VerwijderCriteria from "@/components/buttons/VerwijderCriteria";
import {toRefs} from "@vue/reactivity";
import FunctieFilterService from "@/services/leden/FunctieFilterService";

export default {
  name: "FunctieSelect",
  components: {
    VerwijderCriteria
  },

  props: {
    criteria: {
      type: Array
    },
    criteriaKey: {
      type: String
    }
  },

  setup(props) {
    const {
      state,
      allesGeselecteerd,
      label,
      gesorteerdeFuncties,
      opened,
      openSection,
      close,
      activeerFunctie,
      activeerAlleGroepFuncties,
      activeerAlleFuncties
    } = FunctieFilterService.functieFilterSpace(props);

    return {
      ...toRefs(state),
      state,
      allesGeselecteerd,
      label,
      gesorteerdeFuncties,
      opened,
      openSection,
      close,
      activeerFunctie,
      activeerAlleGroepFuncties,
      activeerAlleFuncties
    }
  },
}
</script>

<template>
  <div class="functies-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span class="font18"> Functies toevoegen</span>
        </div>
        <div :class="laden ? 'functies-loader' : ''">
          <Indicator :is-loading="laden" :full-page="false" :height=55 :width=55></Indicator>
        </div>
      </template>
      <template #content>
        <accordion :multiple="true">
          <accordionTab v-for="(groep, index) in groepEnfuncties" :key="index"
                        :header="groep.naam + ' - ' + groep.groepsnummer">
            <div class="row" v-if="gesorteerdeFuncties(groep.functies, 'verbond')">
              <div v-for="(functie, index) in gesorteerdeFuncties(groep.functies, 'verbond')" :key="index"
                   class="col-md-6">
                <checkbox
                  :label="functie.beschrijving"
                  :model-value="isSelected(functie, groep.groepsnummer)"
                  @changeValue="voegToeOfVerwijderFunctie(functie, groep.groepsnummer)"
                  :functies="true"
                ></checkbox>
              </div>
            </div>
            <div v-if="gesorteerdeFuncties(groep.functies, 'groep').length > 0">
              <div class="border mt-3 mb-2"></div>
              <label class="mb-2"><strong>Groepseigen functies</strong></label>
              <div class="row">
                <div v-for="(functie, index) in gesorteerdeFuncties(groep.functies, 'groep')" :key="index"
                     class="col-md-6">
                  <checkbox
                    :label="functie.beschrijving"
                    :model-value="isSelected(functie, groep.groepsnummer)"
                    @change="voegToeOfVerwijderFunctie(functie, groep.groepsnummer)"
                    :functies="true"
                  ></checkbox>
                </div>
              </div>
            </div>
          </accordionTab>
        </accordion>
      </template>
    </card>
  </div>
</template>

<script>
import BaseCheckboxLeftFunctieSelect from "@/components/input/BaseCheckboxLeftFunctieSelect";
import FunctieToevoegenService from "@/services/functies/FunctieToevoegenService";
import {toRefs} from "@vue/reactivity";

export default {
  name: "FunctiesToevoegen",
  components: {
    'checkbox': BaseCheckboxLeftFunctieSelect
  },
  props: {
    modelValue: {
      type: Object
    },
  },
  setup(props) {
    const {
      state,
      gesorteerdeFuncties,
      groepsNaam,
      voegToeOfVerwijderFunctie,
      isSelected
    } = FunctieToevoegenService.functieToevoegenSpace(props);

    return {
      ...toRefs(state),
      gesorteerdeFuncties,
      groepsNaam,
      voegToeOfVerwijderFunctie,
      isSelected
    }
  }
}
</script>

<style scoped>

</style>

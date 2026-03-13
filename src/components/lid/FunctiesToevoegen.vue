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
      <template #content><accordion :multiple="true" v-model:activeIndex="activeIndex">
          <accordionTab v-for="(groep, index) in groepEnfuncties" :key="index"
                        :header="groep.naam + ' - ' + groep.groepsnummer">
            <div class="row" v-if="gesorteerdeFuncties(groep.functies, 'verbond')">
              <div v-for="(functie, index) in gesorteerdeFuncties(groep.functies, 'verbond')" :key="index"
                   class="col-md-6 flex justify-content-start">
                <checkbox
                  v-model="geselecteerdeFuncties[groep.groepsnummer]"
                  @change="voegToeOfVerwijderFunctie(functie, groep.groepsnummer)"
                  :value="functie.beschrijving"
                  :input-id="functie.beschrijving"
                ></checkbox>
                <label class="small-text ml-2" :for="functie.beschrijving">{{functie.beschrijving}}</label>
              </div>
            </div>
            <div v-if="gesorteerdeFuncties(groep.functies, 'groep').length > 0">
              <div class="border mt-3 mb-2"></div>
              <label class="mb-2"><strong>Groepseigen functies</strong></label>
              <div class="row">
                <div v-for="(functie, index) in gesorteerdeFuncties(groep.functies, 'groep')" :key="index"
                     class="col-md-6 flex justify-content-start">
                  <checkbox
                    v-model="geselecteerdeFuncties[groep.groepsnummer]"
                    @change="voegToeOfVerwijderFunctie(functie, groep.groepsnummer)"
                    :value="functie.beschrijving"
                    :input-id="functie.beschrijving"
                  ></checkbox>
                  <label class="small-text ml-2" :for="functie.beschrijving">{{functie.beschrijving}}</label>
                </div>
              </div>
            </div>
            <div v-if="gesorteerdeFuncties(groep.functies, 'groep').length === 0 && gesorteerdeFuncties(groep.functies, 'verbond').length === 0">
              <label class="mb-2"><strong>Geen functies beschikbaar</strong></label>
            </div>
          </accordionTab>
        </accordion>
      </template>
    </card>
  </div>
</template>

<script>
import FunctieToevoegenService from "@/services/functies/FunctieToevoegenService";
import {computed, toRefs} from "@vue/reactivity";

export default {
  name: "FunctiesToevoegen",

  props: {
    modelValue: {
      type: Object
    },
    nieuwLid: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const {
      state,
      gesorteerdeFuncties,
      groepsNaam,
      voegToeOfVerwijderFunctie
    } = FunctieToevoegenService.functieToevoegenSpace(props, context);

    const activeIndex = computed(() =>
      props.nieuwLid && state.groepEnfuncties.length === 1 ? [0] : []
    );

    return {
      ...toRefs(state),
      activeIndex,
      gesorteerdeFuncties,
      groepsNaam,
      voegToeOfVerwijderFunctie
    }
  }
}
</script>

<style scoped>

</style>

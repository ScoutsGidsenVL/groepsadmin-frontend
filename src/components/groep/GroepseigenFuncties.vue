<template>
  <div class="mb-4">
    <card>
      <template #title>
        <span>
          Groepseigen functies
        </span>
        <span v-if="kanFunctieWijzigen">
          <Button
            icon="pi pi-plus"
            class="p-button-rounded add-button mt-t float-end mr-1"
            @click="voegGeifToe"
            title="Voeg groepseigen functie toe"
          />
        </span>
      </template>
      <template #content>
        <div class="text-black ml-1 small-text font-light"
             v-if="groep && groep.groepseigenFuncties && groep.groepseigenFuncties.length === 0">
          <p class="small">Geen groepseigen functies beschikbaar voor deze groep.</p>
        </div>
        <div v-if="groep && groep.groepseigenFuncties && groep.groepseigenFuncties.length > 0">
          <div v-for="(functie, index) in gesorteerdeFuncties(groep.groepseigenFuncties)" :key="index">
            <div class="row mb--25">
              <div class="col-12">
                <BaseInputGeig
                  v-model="functie.beschrijving"
                  :disabled="!kanGroepWijzigen"
                  :index="index"
                  @remove="remove"
                ></BaseInputGeig>
              </div>
            </div>
          </div>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import {toRefs} from "@vue/reactivity";
import BaseInputGeig from "@/components/input/BaseInputGeig";
import GroepseigenFunctieService from "@/services/groep/GroepseigenFunctieService";

export default {
  name: "GroepseigenFuncties",
  components: {
    BaseInputGeig,
  },

  props: {
    modelValue: {
      type: Object,
    },
  },

  setup(props) {

    const {
      state,
      voegGeifToe,
      remove,
      gesorteerdeFuncties,
      kanFunctieWijzigen,
      kanGroepWijzigen
    } = GroepseigenFunctieService.groepseigenFunctiesSpace(props)

    return {
      ...toRefs(state),
      voegGeifToe,
      remove,
      gesorteerdeFuncties,
      kanFunctieWijzigen,
      kanGroepWijzigen
    };
  }
}
</script>

<style scoped></style>

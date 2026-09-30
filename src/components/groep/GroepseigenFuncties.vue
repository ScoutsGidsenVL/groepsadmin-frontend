<template>
  <div class="mb-4">
    <card>
      <template #title>
        <div class="d-flex align-items-center justify-content-between">
          <span class="font18">Groepseigen functies</span>
          <div class="geig-iconen" v-if="kanGroepWijzigen">
            <Button
              icon="pi pi-plus"
              class="p-button-rounded add-button mt-t geig-icoon-knop"
              @click="voegGeifToe"
              title="Voeg groepseigen functie toe"
            />
          </div>
        </div>
      </template>
      <template #content>
        <div
          class="text-black ml-1 small-text font-light"
          v-if="
            (groep &&
              groep.groepseigenFuncties &&
              groep.groepseigenFuncties.length === 0) ||
            groep.groepseigenFuncties == null
          "
        >
          <p class="small">
            Geen groepseigen functies beschikbaar voor deze groep.
          </p>
        </div>
        <div
          v-if="
            groep &&
            groep.groepseigenFuncties &&
            groep.groepseigenFuncties.length > 0
          "
        >
          <div
            v-for="(functie, index) in gesorteerdeFuncties"
            :key="functie.id"
          >
            <div class="row geig-functie-rij">
              <div class="col-12">
                <BaseInputGeig
                  v-model="functie.beschrijving"
                  :disabled="!kanGroepWijzigen"
                  :index="index"
                  :toon-opslaan="kanGroepWijzigen && magOpslaan(functie)"
                  :bezig-met-opslaan="isBezigMetOpslaan(functie)"
                  @remove="remove"
                  @opslaan="opslaanFunctie(functie)"
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
import { toRefs } from "@vue/reactivity";
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
    kanGroepWijzigen: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const {
      state,
      voegGeifToe,
      remove,
      opslaanFunctie,
      magOpslaan,
      isBezigMetOpslaan,
    } = GroepseigenFunctieService.groepseigenFunctiesSpace(props);

    return {
      ...toRefs(state),
      voegGeifToe,
      remove,
      opslaanFunctie,
      magOpslaan,
      isBezigMetOpslaan,
    };
  },
};
</script>

<style scoped></style>

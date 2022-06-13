<template>
  <div class="mb-4">
    <card>
      <template #title>
        <span>
          Groepseigen functies
        </span>
        <span v-if="kanGroepWijzigen">
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
          <div v-for="(functie, index) in groep.groepseigenFuncties" :key="index">
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
import {reactive, toRefs} from "@vue/reactivity";
import {onUpdated} from "@vue/runtime-core";
import BaseInputGeig from "@/components/input/BaseInputGeig";
import rechtenService from "@/services/rechten/rechtenService";
import RestService from "@/services/api/RestService";
import store from "@/store";

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
  methods: {
    remove(index) {
      let geif = this.groep.groepseigenFuncties[index];
      let id = geif.id.substring(0, 11);

      this.$confirm.require({
        message: "Ben je zeker dat je de functie " + ( geif.beschrijving ? geif.beschrijving : '' )   + " wil verwijderen?",
        header: "Functie verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          if (id !== 'tempFunctie') {
            RestService.verwijderFunctie(geif.id)
              .then(res => {
                if (res.status === 204) {
                  this.groep.groepseigenFuncties.splice(index, 1);
                  store.dispatch("getGroepen");
                  this.$toast.add({
                    severity: "success",
                    summary: "Functie",
                    detail: "Functie verwijderd.",
                    life: 3000,
                  });
                }
              }).catch((error) => {
              if (error.response.status === 404) {
                this.$toast.add({
                  severity: "warn",
                  summary: "Functie",
                  detail: "Functie bestaat niet meer",
                  life: 8000,
                });
              } else {
                this.$toast.add({
                  severity: "warn",
                  summary: "Functie",
                  detail: error.response.data.beschrijving,
                  life: 8000,
                });
              }
            })
          } else {
            this.groep.groepseigenFuncties.splice(index, 1);
            this.$toast.add({
              severity: "success",
              summary: "Functie",
              detail: "Functie verwijderd.",
              life: 3000,
            });
          }
        },
        reject: () => {
          this.$confirm.close();
        },
      });
    },

    voegGeifToe() {
      let nieuweFunctie = {
        id: 'tempFunctie' + Math.random(),
        beschrijving: null,
        groepen: [this.groep.groepsnummer]
      };
      this.groep.groepseigenFuncties.push(nieuweFunctie);
    }
  },
  computed: {
    kanGroepWijzigen() {
      return rechtenService.kanWijzigen(this.groep);
    }
  },
  setup(props) {
    const state = reactive({
      groep: {},
    });

    onUpdated(() => {
      state.groep = props.modelValue;
    });

    return {...toRefs(state)};
  }
}
</script>

<style scoped></style>

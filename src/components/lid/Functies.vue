<template>
  <div class="functies-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> Functies </span>
        </div>
        <div class="d-flex col-12">
          <InputSwitch v-model="historiek"/>
          <span class="ml-2 text-sm">Historiek weergeven</span>
        </div>
        <div :class="laden ? 'functies-loader' : ''">
          <Indicator :is-loading="laden" :full-page="false" :height=55 :width=55></Indicator>
        </div>
      </template>
      <template #content>
        <accordion :multiple="true" v-if="!laden">
          <accordionTab v-for="(functies, nummer) in actieveGroepen" :key="nummer" :header="groepsNaam(nummer)">
            <div v-for="(functie, index) in functies" :key="index">
              <div v-if="functie.actief" class="functie-wrapper">
                <div class="flex-row">
                  <div class="justify-content-between">
                    <label>van {{ formatteerDatum(functie.begin) }}</label>
                    <Button
                      v-if="lidMagFunctieStoppen('functies.' + nummer)"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-outlined p-button-danger remove-button mr-1 mt-2"
                      @click="
                        $event.stopPropagation();
                        stopFunctie(functie, nummer);
                      "
                      title="Stop functie"
                    />
                  </div>
                </div>
                <div class="flex-row">
                  <div class="justify-content-start">
                    <label class="ml-4 font-bold">{{ functie.naam }}</label>
                  </div>
                </div>
                <div class="border mt-3"></div>
              </div>
            </div>
            <div v-for="(functie, index) in functies" :key="index">
              <div v-show="!functie.actief && historiek" class="functie-wrapper"
                   :class="!functie.actief ? 'inactive-function' : ''">
                <div class="flex-row">
                  <div class="justify-content-between">
                    <label>van {{ formatteerDatum(functie.begin) }}&nbsp;</label>
                    <label> tot {{ formatteerDatum(functie.einde) }}</label>
                  </div>
                </div>
                <div class="flex-row">
                  <div class="justify-content-start">
                    <label class="ml-4 font-bold">{{
                        functie.naam
                      }}</label>
                  </div>
                </div>
                <div class="border mt-3"></div>
              </div>
            </div>
          </accordionTab>
        </accordion>
        <div v-if="historiek && !laden">
          <accordion :multiple="true">
            <accordionTab v-for="(functies, index) in nietActieveGroepen" :key="index" :header="inactieveGroepsNaam(index)">
              <div v-for="(functie, index) in functies" :key="index" class="inactive-function">
                <div class="flex-row">
                  <div class="justify-content-between">
                    <label>van {{ formatteerDatum(functie.begin) }}&nbsp;</label>
                    <label> tot {{ formatteerDatum(functie.einde) }}</label>
                  </div>
                </div>
                <div class="flex-row">
                  <div class="justify-content-start">
                    <label class="ml-4 font-bold">{{
                        functie.naam
                      }}</label>
                  </div>
                </div>
                <div class="border mt-3"></div>
              </div>
            </accordionTab>
          </accordion>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import DateUtil from "@/services/dates/DateUtil";
import Indicator from "@/components/global/Indicator";
import rechtenService from "@/services/rechten/rechtenService";

export default {
  name: "Functies",
  components: {Indicator},
  data() {
    return {
      historiek: false,
      confirmDialog: false,
      teStoppenFunctie: {}
    }
  },
  props: {
    modelValue: {
      type: Object, Array
    },
    lid: {
      type: Object
    }
  },
  computed: {
    actieveGroepen() {
      return Object.fromEntries(Object.entries(this.modelValue).filter(([key]) => this.modelValue[key].active));
    },
    nietActieveGroepen() {
      return Object.fromEntries(Object.entries(this.modelValue).filter(([key]) => !this.modelValue[key].active));
    },
    laden() {
      return this.$store.getters.groepenLaden || this.$store.getters.functiesLaden;
    },
  },
  methods: {
    groepsNaam(groepsnummer) {
      let groep = this.$store.getters.groepByNummer(groepsnummer);
      if (groep) {
        return groep.naam + " - " + groepsnummer;
      }
    },

    boodschapStoppenFunctie() {
      let message = "";
      if (this.teStoppenFunctie) {
        message = "Ben je zeker dat je de functie " + this.teStoppenFunctie.naam + " wil stoppen?"
      }
      return message;
    },

    inactieveGroepsNaam(groepsnummer) {
      let groep = this.$store.getters.inactieveGroepByNummer(groepsnummer);
      if (groep) {
        return groep.naam + " - " + groepsnummer;
      }
    },

    lidMagFunctieStoppen(sectie) {
      return rechtenService.hasPermission(sectie);
    },

    getFunctie(functieId) {
      return this.$store.getters.functieById(functieId);
    },
    formatteerDatum(datum) {
      return DateUtil.formatteerDatum(datum);
    },
    stopFunctie(functie, groepsnummer) {
      this.teStoppenFunctie = Object.assign({}, functie);;
      this.$confirm.require({
        message: this.boodschapStoppenFunctie(),
        header: "Functie stoppen",
        icon: "pi pi-exclamation-triangle",
        acceptIcon: "pi pi-check",
        rejectIcon: "pi pi-times",
        acceptClass: "approve-button",
        rejectClass: "reject-button",
        accept: () => {
          this.teStoppenFunctie.einde = new Date();
          this.$emit('updateLid',  {functie: this.teStoppenFunctie, groepsnummer: groepsnummer });
        },
        reject: () => {
          this.$confirm.close();
        }

      })
    },
  },

};
</script>

<style scoped></style>

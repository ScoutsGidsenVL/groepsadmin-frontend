<template>
  <div class="functies-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> {{ title }}</span>
        </div>
      </template>
      <template #content>
        <accordion :multiple="true">
          <accordionTab v-for="(functies, index) in functies" :key="index">
            <template #header>
              <div class="d-flex col-12 justify-content-between">
                {{ groepsNaam(index) }}
              </div>
            </template>
            <div v-for="(functie, index) in functies" :key="index">
              <div v-if="functie.actief">
                <div class="flex-row">
                  <div class="justify-content-between">
                    <label>van {{ formatteerDatum(functie.begin) }}</label>
                    <Button
                      icon="pi pi-times"
                      class="p-button-rounded p-button-outlined p-button-danger remove-button mr-1 mt-2"
                      @click="
                        $event.stopPropagation();
                        end(functie.id);
                      "
                      title="Stop functie"
                    />
                  </div>
                </div>
                <div class="flex-row">
                  <div class="justify-content-start">
                    <label class="ml-4 font-weight-bolder">{{
                      functie.naam
                    }}</label>
                  </div>
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
import DateUtil from "@/services/dates/DateUtil";

export default {
  name: "Functies",
  props: {
    modelValue: {
      type: Object,
    },
    title: {
      type: String,
    },
  },
  computed: {
    functies() {
      return this.modelValue;
    },
  },
  methods: {
    groepsNaam(groepsnummer) {
      const groep = this.$store.getters.groepByNummer(groepsnummer);
      return groep.naam + " - " + groepsnummer;
    },
    getFunctie(functieId) {
      return this.$store.getters.functieById(functieId);
    },
    formatteerDatum(datum) {
      return DateUtil.formatteerDatum(datum);
    },
    end(id) {
      console.log(id);
    },
  },
};
</script>

<style scoped></style>

<template>
  <div class="groepseigen-gegeven-card mb-4" v-if="checkGroepsEigenGegevens(gegVelden)">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> {{ title }}</span>
          <div :class="groepenLaden ? 'functies-loader' : ''">
            <Indicator :is-loading="groepenLaden" :full-page="false" :height=55 :width=55></Indicator>
          </div>
        </div>
      </template>
      <template #content>
        <accordion :multiple="true" v-if="!groepenLaden">
          <accordionTab v-for="(geg, index) in gefilterdeVelden" :key="index">
            <template #header>
              <div class="d-flex col-12 justify-content-between">
                <span>
                  {{ groepNaam(index) }}
                </span>
              </div>
            </template>
            <dynamisch-veld
              :veld="gegVelden[index].schema"
              :model-value="gegVelden[index].waarden"
              :groepIndex="index"
              @changeValue="changeValue"
              class="groepseigengegevens"
            ></dynamisch-veld>
          </accordionTab>
        </accordion>
      </template>
    </card>
  </div>
</template>

<script>
import DynamischVeld from "@/components/input/DynamischVeld";
import Indicator from "@/components/global/Indicator";

export default {
  name: "GroepseigenGegevens",
  components: {
    DynamischVeld,
    Indicator
  },
  props: {
    title: {
      type: String,
    },
    modelValue: {
      type: Object, Array
    },
  },
  computed: {
    groepenLaden() {
      return this.$store.getters.groepenLaden;
    },
    gegVelden() {
      return this.modelValue;
    },
    gefilterdeVelden() {
      return this.modelValue;
    },
    groepen() {
      return this.$store.getters.indexedGroepen;
    },

  },

  methods: {
    groepNaam(groepsnummer) {
      let groep = this.$store.getters.groepByNummer(groepsnummer);
      if (groep) {
        return groep.naam + " - " + groepsnummer;
      } else {
        groep = this.$store.getters.inactieveGroepByNummer(groepsnummer);
        if (groep) {
          return groep.naam + " - " + groepsnummer;
        } else {
          return groepsnummer
        }
      }
    },
    checkGroepsEigenGegevens() {
      return true;
    }
  },
};
</script>

<style scoped></style>

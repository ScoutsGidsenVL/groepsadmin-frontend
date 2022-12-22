<template>
  <div class="functies-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> Functies toevoegen</span>
        </div>
        <div :class="laden ? 'functies-loader' : ''">
          <Indicator :is-loading="laden" :full-page="false" :height=55 :width=55></Indicator>
        </div>
      </template>
      <template #content>
        <accordion :multiple="true">
          <accordionTab v-for="(groep, index) in groepEnfuncties" :key="index"
                        :header="groep.naam + ' - ' + groep.groepsnummer">
            <div class="row">
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
import rechtenService from "@/services/rechten/rechtenService";
import BaseCheckboxLeftFunctieSelect from "@/components/input/BaseCheckboxLeftFunctieSelect";
import moment from "moment";

export default {
  name: "FunctiesToevoegen",
  components: {
    'checkbox': BaseCheckboxLeftFunctieSelect
  },
  data() {
    return {
      laden: false,
      functiesEnGroepenGeladen: false,
      showFunctieToevoegen: false,
      groepEnfuncties: [],
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
    huidigLid() {
      return this.lid;
    }
  },
  mounted() {
    this.functiesEnGroepen();
  },
  methods: {
    gesorteerdeFuncties(functies, type) {
      let relevanteFuncties = [];
      if (this.lid && this.lid.vgagegevens && this.lid.vgagegevens.geboortedatum) {
        relevanteFuncties =  functies.filter(obj => {
          return moment(this.lid.vgagegevens.geboortedatum).isBefore(moment(obj.uiterstegeboortedatum));
        });
      } else {
        relevanteFuncties = functies;
      }

      relevanteFuncties.sort(function (a, b) {
        if (a.beschrijving < b.beschrijving) {
          return -1;
        }
        if (a.beschrijving > b.beschrijving) {
          return 1;
        }
        return 0;
      })
      return relevanteFuncties.filter(obj => {
        return obj.type === type;
      });
    },

    functiesEnGroepen() {
      this.groepEnfuncties = [];
      this.$store.getters.groepen.forEach(groep => {
        if (rechtenService.hasPermission('functies.' + groep.groepsnummer)) {
          let tempGroep = groep;
          tempGroep.functies = [];
          this.$store.getters.functies.forEach(functie => {
            let bestaandeFunctie = false;
            if (this.huidigLid && this.huidigLid.functies) {
              this.huidigLid.functies.forEach(lidFunctie => {
                if (lidFunctie.groep === groep.groepsnummer && lidFunctie.functie === functie.id) {
                  bestaandeFunctie = true;
                }
              })
            }
            if (functie.groepen.indexOf(tempGroep.groepsnummer) !== -1 && !bestaandeFunctie) {
              tempGroep.functies.push(functie);
            }
          });
          this.groepEnfuncties.push(tempGroep);
        }
      });

      this.functiesEnGroepenGeladen = true;
      this.showFunctieToevoegen = false;

      this.groepEnfuncties.forEach(groep => {
        this.showFunctieToevoegen |= rechtenService.hasPermission('functies.' + groep.groepsnummer);
      });

    },
    groepsNaam(index) {
      let groep = this.$store.getters.groepen[index];
      if (groep) {
        return groep.naam + " - " + groep.groepsnummer;
      }
    },
    voegToeOfVerwijderFunctie(functie, groepsnummer) {
      let functieInstantie = {};
      functieInstantie.functie = functie.id;
      functieInstantie.groep = groepsnummer;
      functieInstantie.begin = '2016-01-01T00:00:00.000+01:00'; // set static date
      functieInstantie.temp = "tijdelijk";

      let bestaandeFunctie = false;

      if (this.huidigLid && this.huidigLid.functies) {
        for (let [index, val] of this.huidigLid.functies.entries()) {
          if (val.functie === functie.id && val.groep === groepsnummer) {
            bestaandeFunctie = true;
            this.huidigLid.functies.splice(index, 1);
          }
        }
      }
      if (!bestaandeFunctie) {
        if (!this.huidigLid.functies) {
          this.huidigLid.functies = [];
        }
        this.huidigLid.functies.push(functieInstantie);
      }
      this.emitter.emit("veranderFunctie", null);
    },
    isSelected(functie, groepsnummer) {
      let geselecteerd = false;
      if (this.huidigLid && this.huidigLid.functies) {
        this.huidigLid.functies.forEach(lidFunctie => {
          if (functie.id === lidFunctie.functie && lidFunctie.groep === groepsnummer) {
            geselecteerd = true;
          }
        })
      }
      return geselecteerd;
    }
  }

}
</script>

<style scoped>

</style>

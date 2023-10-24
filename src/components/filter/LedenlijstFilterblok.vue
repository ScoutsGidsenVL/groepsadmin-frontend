<template>
  <div class="row md:mt-3 z999">
    <ConfirmDialog/>
    <div class="col-12">
      <div class="">
        <div class="row">
          <div class="col-12 col-md-6 col-xl-3 d-flex justify-content-start">
            <dropdown @change="veranderFilter"
                      v-model="geselecteerdeFilter"
                      :options="filters"
                      option-label="label"
                      option-group-label="label"
                      scrollHeight="500px"
                      input-class="filter-select"
                      option-group-children="items"
                      placeholder="Huidige filter"
                      class="col-12">
              <template #optiongroup="slotProps">
                <div class="flex align-items-center filter-item">
                  <div><strong>{{ slotProps.option.label }}</strong></div>
                </div>
              </template>
            </dropdown>
          </div>
          <div class="row">
            <div class="col-12 col-md-6 col-xl-3 flex justify-content-start" v-if="filterOpslaanMode">
              <AutoComplete
                class="custom-input-styling p-0 col-12"
                v-model="zoekTerm"
                dense
                field="label"
                minLength=2
                :suggestions="geselecteerdeFilters"
                @complete="zoekBestaandefilter"
                @itemSelect="kiesFilter"
                @change="checkBestaandeFilter"
                placeholder="Naam van sjabloon"
                inputClass="autocomplete-input"
                @clear="clearSelectedFilter"
              >
                <template #item="slotProps">
                  <div class="ml-2">
                    {{ slotProps.item.label }}
                  </div>
                </template>
              </AutoComplete>
            </div>
            <div class="col-12 col-md-6 col-xl-4 flex justify-content-start"
                 v-if="(!geselecteerdeFilter || (geselecteerdeFilter && !geselecteerdeFilter.value.id)) && kanFilterDelen && filterOpslaanMode">
              <div class="flex align-items-end ml-1">
                <checkbox :binary="true" id="label" class="mr-2 ml--05" v-model="filterDelen"/>
                <label class="text-align-left" for="label">Als gedeelde filter</label>
              </div>
            </div>
            <div class="col-12 col-md-6  flex justify-content-start">

              <Opslaan title="Filter opslaan" @opslaan="filterOpslaan" v-if="filterOpslaanMode"
                       class="col-6 col-md-6"
                       :label="opslaanLabel"></Opslaan>
              <Button :label="filterOpslaanMode ? 'Annuleren' : 'Filter opslaan'"
                      :icon="filterOpslaanMode ? 'fas fa-ban' : 'fas fa-plus'"
                      class="actie-button w-92 col-6"
                      :class="filterOpslaanMode ? 'ml-1' : ''"
                      @click="filterOpslaanMode = !filterOpslaanMode; zoekTerm = ''"
              ></Button>
              <Button v-if="!geselecteerdeFilter && !filterOpslaanMode"
                      label="Filter toepassen"
                      :icon="'fas fa-check'" class="opslaan-knop ml-2 text-nowrap col-6"
                      :disabled="!changes"
                      @click="filterToepassen"></Button>
              <Button v-if="geselecteerdeFilter && !filterOpslaanMode"
                      label="Filter verwijderen"
                      :icon="'fas fa-trash'" class="opslaan-knop ml-1 text-nowrap col-6"
                      @click="filterVerwijderen"></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <criteria-select :criteria="inActivecriteria" @activateCriterium="selecteerCriterium"
                     v-if="inActivecriteria.length > 0"></criteria-select>
    <div v-for="(criteria, index) in activeCriteria" :key="index" class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <BoolFilter :activeCriteria="activeCriteria" :criteria-key="criteria.criteriaKey"
                  @deactivateCriterium="deactivateCriterium"
                  v-if="criteria.criteriaKey === 'adresgeblokkeerd' || criteria.criteriaKey === 'verminderdLidgeld'
                  || criteria.criteriaKey === 'emailgeblokkeerd' || criteria.criteriaKey === 'emailleeg' || criteria.criteriaKey === 'geenLidkaart'">
      </BoolFilter>
      <OudLedenSelect :criteria="criteria" v-if="criteria.criteriaKey === 'oudleden'" :value="criteria.value"
                      @deactivateCriterium="deactivateCriterium"></OudLedenSelect>
      <GeslachtSelect :criteria="criteria" v-if="criteria.criteriaKey === 'geslacht'" :value="criteria.value"
                      @deactivateCriterium="deactivateCriterium"
      ></GeslachtSelect>
      <GroepenSelect :criteria="criteria" v-if="criteria.criteriaKey === 'groepen'"
                     @deactivateCriterium="deactivateCriterium"/>
      <leeftijd-select :criteria="criteria" v-if="criteria.criteriaKey === 'leeftijd'" :value="criteria.value"
                       @deactivateCriterium="deactivateCriterium"></leeftijd-select>
      <functie-select :criteria="criteria"
                      v-if="criteria.criteriaKey === 'functies' && (criteria.criteriaSubKey === 'verbonds' || criteria.criteriaSubKey === 'groepspecifiek')"
                      :value="criteria.value"
                      @deactivateCriterium="deactivateCriterium"
                      @activeerAlleFuncties="activeerAlleFuncties"
                      @deactiveerAlleFuncties="deactiveerAlleFuncties"

      ></functie-select>
      <groepseigen-gegevens-select :criteria="criteria" v-if="criteria.criteriaKey === 'groepseigen'"
                                   :value="criteria.value"
                                   @deactivateCriterium="deactivateCriterium"></groepseigen-gegevens-select>
      <individuele-steekkaart-select :criteria="criteria" v-if="criteria.criteriaKey === 'individuelesteekkaart'"
                                     :value="criteria.value"
                                     @deactivateCriterium="deactivateCriterium"></individuele-steekkaart-select>
    </div>
    <KolommenSelect
      :actieveKolommen="actieveKolommen"
      :nonActieveKolommen="nonActieveKolommen"
      @setActieveKolom="setActieveKolom"
      @setNonActieveKolom="setNonActieveKolom"
      @kolomVolgordeVeranderd="kolomVolgordeVeranderd"
    ></KolommenSelect>
  </div>
</template>

<script>
import KolommenSelect from "@/components/filter/KolommenSelect";
import Opslaan from "@/components/buttons/Opslaan";
import CriteriaSelect from "@/components/filter/CriteriaSelect";
import BoolFilter from "@/components/filter/BoolFilter";
import OudLedenSelect from "@/components/filter/OudLedenSelect";
import GeslachtSelect from "@/components/filter/GeslachtSelect";
import GroepenSelect from "@/components/filter/GroepenSelect";
import LeeftijdSelect from "@/components/filter/LeeftijdSelect";
import FunctieSelect from "@/components/filter/FunctieSelect";
import IndividueleSteekkaartSelect from "@/components/filter/IndividueleSteekkaartSelect";
import GroepseigenGegevensSelect from "@/components/filter/GroepseigenGegevensSelect";
import AutoComplete from "primevue/autocomplete";
import rechtenService from "@/services/rechten/rechtenService";
import restService from "@/services/api/RestService";
import ConfirmDialog from 'primevue/confirmdialog';


export default {
  name: "LedenlijstFilterblok",
  components: {
    GeslachtSelect,
    OudLedenSelect,
    BoolFilter,
    CriteriaSelect,
    KolommenSelect,
    GroepenSelect,
    Opslaan,
    LeeftijdSelect,
    FunctieSelect,
    IndividueleSteekkaartSelect,
    GroepseigenGegevensSelect,
    AutoComplete,
    ConfirmDialog
  },

  props: {
    actieveKolommen: {
      type: Array
    },
    nonActieveKolommen: {
      type: Array
    },
    filters: {
      type: Array
    },
    huidigeFilter: {
      type: Object
    },
    activeCriteria: {
      type: Array
    },
    criteria: {
      type: Array
    }
  },

  data() {
    return {
      filterOpslaanMode: false,
      bestaandeNaam: false,
      filterDelen: false,
      changes: false,
      nieuweFilternaam: '',
      zoekTerm: '',
      geselecteerdeFilter: null,
      geselecteerdeFilters: [],
      geselecteerdeFilterNaam: "Huidige filter",
      inActivecriteria: [],
    }
  },

  methods: {
    veranderFilter(event) {
      this.$emit('veranderFilter', event.value.value);
    },

    filterOpslaan() {
      this.changes = false;
      this.filterOpslaanMode = false;
      return this.$emit('filterOpslaan', this.zoekTerm, this.filterDelen, (this.geselecteerdeFilter && this.geselecteerdeFilter.value.id) ? this.geselecteerdeFilter.value.id : null);
    },

    selecteerCriterium(criterium) {
      this.changes = true;
      this.$emit('activateCriterium', criterium);
      this.defineInactiveCriteria();
    },

    deactivateCriterium(criterium) {
      this.changes = true;
      this.$emit('deactivateCriterium', criterium)
    },

    changeGegKeuzeCriterium(criterium) {
      this.changes = true;
      this.$emit('changeGegKeuzeCriterium', criterium)

    },

    setNonActieveKolom() {
      this.changes = true;
      this.$emit('setNonActieveKolom');
    },

    setActieveKolom() {
      this.changes = true;
      this.$emit('setActieveKolom');
    },

    kolomVolgordeVeranderd() {
      this.changes = true;
    },

    filterToepassen() {
      this.changes = false;
      this.$emit('filterToepassen');
    },

    zoekBestaandefilter() {
      this.zoekTerm.trim();
      this.geselecteerdeFilters = [];
      this.filters.forEach(filter => {
        filter.items.forEach((item) => {
          if (item.label.toLowerCase().indexOf(this.zoekTerm.toLowerCase()) > -1) {
            this.geselecteerdeFilters.push(item);
          }
        });
      });
    },

    activeerAlleFuncties(event) {
      this.changes = true;
      this.$emit('activeerAlleFuncties', event);
    },

    deactiveerAlleFuncties(event) {
      this.changes = true;
      this.$emit('deactiveerAlleFuncties', event);
    },

    clearSelectedFilter() {
      this.zoekTerm = "";
      this.geselecteerdeFilter = null;
    },

    kiesFilter(event) {
      this.zoekTerm = event.value.label;
      this.zoekTerm.trim();
      this.selecteerFilter();
      this.checkBestaandeFilter();
    },

    checkBestaandeFilter() {
      this.bestaandeNaam = false;
      this.filters.forEach((filter) => {
        filter.items.forEach(item => {
          if (item.label === this.zoekTerm) {
            this.bestaandeNaam = true;
          }
        })
      });
      if (!this.bestaandeNaam) {
        this.geselecteerdeFilter = null;
      }
    },

    kanFilterDelen() {
      setTimeout(() => {
        return rechtenService.hasAccess("filter delen")
      }, 2000);
    },

    selecteerFilter() {
      this.zoekTerm.trim();
      this.filters.forEach((filter) => {
        filter.items.forEach(item => {
          if (item.label === this.zoekTerm) {
            this.geselecteerdeFilter = item;
          }
        })
      });
    },

    defineInactiveCriteria() {
      if (this.criteria && this.criteria.arrCriteria) {
        this.inActivecriteria = this.criteria.arrCriteria.filter(crit => {
          return !crit.activated
        });
      }
    },

    filterVerwijderen() {
      if (this.geselecteerdeFilter && this.geselecteerdeFilter.value.id) {
        this.$confirm.require({
          message:
            "Ben je zeker dat je deze filter wil verwijderen?",
          header: "Filter verwijderen",
          icon: "pi pi-exclamation-triangle",
          accept: () => {
            restService.verwijderFilter(this.geselecteerdeFilter.value.id)
              .then(res => {
                this.$emit("onLoading")
                if (res.status === 204) {
                  this.$toast.add({
                    severity: "success",
                    summary: "Filter",
                    detail: "Filter verwijderd.",
                    life: 3000,
                  });
                }
              }).finally(() => {
              this.$emit("offLoading")
            })
          },
          reject: () => {
            this.$confirm.close();
          }
        })
      }
    }
  },

  created() {
    this.emitter.on('deactivateCriterium', (event) => {
      this.changes = true;
      this.deactivateCriterium(event.criteria);
    })
    this.emitter.on(
      'activeerAlleFuncties', () => {
        this.changes = true;
      })
    this.emitter.on(
      'changeOudLidCriterium', () => {
        this.changes = true;
      })
    this.emitter.on(
      'changeGeslachtCriterium', () => {
        this.changes = true;
      })
    this.emitter.on(
      'deactiveerAlleFuncties', () => {
        this.changes = true;
      })
    this.emitter.on(
      'activeerFunctie', () => {
        this.changes = true;
      })
    this.emitter.on(
      'changeGegKeuzeCriterium', (criterium) => {
        this.changeGegKeuzeCriterium(criterium)
        this.changes = true;
      })
    this.emitter.on(
      'activeerAlleGroepFuncties', () => {
        this.changes = true;
      })
    this.emitter.on(
      'deactiveerAlleGroepFuncties', () => {
        this.changes = true;
      })
    this.emitter.on(
      'deactiveerGroepseigenGegeven', () => {
        this.changes = true;
      })
    this.emitter.on(
      'changeSteekkaartCriterium', () => {
        this.changes = true;
      })
    this.emitter.on(
      'changeLeeftijd', () => {
        this.changes = true;
      })
    this.emitter.on(
      'changeGroepCriterium', () => {
        this.changes = true;
      })
    this.emitter.on(
      "activeerFunctie", () => {
        this.changes = true;
      })

    this.$watch(
      "criteria.arrCriteria",
      () => {
        this.defineInactiveCriteria()
      },
      {
        immediate: true,
      }
    );
  },

  computed: {
    inActiveCriteriaComputed: {
      get() {
        return this.inActivecriteria
      },
    },
    opslaanLabel() {
      return (this.geselecteerdeFilter && this.geselecteerdeFilter.value.id) ? 'Overschrijven' : 'Opslaan';
    }
  },
}
</script>

<style scoped>

</style>

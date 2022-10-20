<template>
  <div class="row mt-4 z999">
    <div class="col-lg-12">
      <div class="d-flex justify-content-start">
        <dropdown @change="veranderFilter" :options="filters" option-label="label" option-group-label="label"
                  scrollHeight="500px"
                  option-group-children="items" placeholder="Huidige" class="w-25">
          <template #optiongroup="slotProps">
            <div class="flex align-items-center filter-item">
              <div><strong>{{ slotProps.option.label }}</strong></div>
            </div>
          </template>
        </dropdown>
        <Button :label="filterOpslaanMode ? 'Annuleren' : 'Filter opslaan'"
                :icon="filterOpslaanMode ? 'fas fa-ban' : 'fas fa-plus'" class="ml-2 opslaan-button"
                @click="filterOpslaanMode = !filterOpslaanMode"></Button>
        <Button label="Filter toepassen"
                :icon="'fas fa-check'" class="ml-2 opslaan-knop"
                v-if="!filterOpslaanMode"
                @click="filterToepassen"></Button>
      </div>
    </div>
    <div class="col-lg-12 mt-2">
      <div class="d-flex justify-content-start">
        <AutoComplete
          class="adres-autocomplete d-flex custom-input-styling w-25"
          v-model="zoekTerm"
          field="label"
          minLength=2
          :suggestions="geselecteerdeFilters"
          @complete="zoekBestaandefilter"
          @itemSelect="kiesFilter"
          @change="checkBestaandeFilter"
          placeholder="Naam van sjabloon"
          inputClass="autocomplete-input"
          panelClass="autocomplete-panel"
          :disabled="disabled"
          @clear="clearSelectedFilter"
          :class="error ? 'p-invalid' : ''"
          v-if="filterOpslaanMode"
        >
          <template #item="slotProps">
            <div class="ml-2">
              {{ slotProps.item.label }}
            </div>
          </template>
        </AutoComplete>
        <div v-if="(!geselecteerdeFilter || (geselecteerdeFilter && !geselecteerdeFilter.value.id)) && kanFilterDelen && filterOpslaanMode" class="ml-2 mt-1">
          <checkbox :binary="true" id="label" class="mr-2" v-model="filterDelen"/>
          <label class="text-align-left" for="label">Als gedeelde filter</label>
        </div>
        <Opslaan title="Filter opslaan" @opslaan="filterOpslaan" v-if="filterOpslaanMode" class="ml-2" :label="opslaanLabel"></Opslaan>
      </div>
    </div>
  </div>
  <div class="row">
    <criteria-select :criteria="inActivecriteria" @activateCriterium="selecteerCriterium"
                     v-if="inActivecriteria.length > 0"></criteria-select>
    <div v-for="(criteria, index) in activeCriteria" :key="index" class="col-lg-2 mt-2">
      <BoolFilter :activeCriteria="activeCriteria" :criteria-key="criteria.criteriaKey"
                  @deactivateCriterium="deactivateCriterium"
                  v-if="criteria.criteriaKey === 'adresgeblokkeerd' || criteria.criteriaKey === 'verminderdLidgeld' || criteria.criteriaKey === 'emailgeblokkeerd'"></BoolFilter>
      <OudLedenSelect :criteria="criteria" v-if="criteria.criteriaKey === 'oudleden'" :value="criteria.value"
                      @deactivateCriterium="deactivateCriterium"></OudLedenSelect>
      <GeslachtSelect :criteria="criteria" v-if="criteria.criteriaKey === 'geslacht'" :value="criteria.value"
                      @deactivateCriterium="deactivateCriterium"
      ></GeslachtSelect>
      <GroepenSelect :criteria="criteria" v-if="criteria.criteriaKey === 'groepen'" :value="criteria.value"
                     @deactivateCriterium="deactivateCriterium">
      </GroepenSelect>
      <leeftijd-select :criteria="criteria" v-if="criteria.criteriaKey === 'leeftijd'" :value="criteria.value"
                       @deactivateCriterium="deactivateCriterium"></leeftijd-select>
      <functie-select :criteria="criteria"
                      v-if="criteria.criteriaKey === 'functies' && (criteria.criteriaSubKey === 'verbonds' || criteria.criteriaSubKey === 'groepspecifiek')"
                      :value="criteria.value"
                      @deactivateCriterium="deactivateCriterium"></functie-select>
      <groepseigen-gegevens-select :criteria="criteria" v-if="criteria.criteriaKey === 'groepseigen'"
                                   :value="criteria.value"
                                   @deactivateCriterium="deactivateCriterium"></groepseigen-gegevens-select>
      <individuele-steekkaart-select :criteria="criteria" v-if="criteria.criteriaKey === 'individuelesteekkaart'"
                                     :value="criteria.value"
                                     @deactivateCriterium="deactivateCriterium"></individuele-steekkaart-select>
    </div>
    <KolommenSelect :actieveKolommen="actieveKolommen" :nonActieveKolommen="nonActieveKolommen"
                    @setActieveKolom="setActieveKolom" @setNonActieveKolom="setNonActieveKolom"></KolommenSelect>
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
    AutoComplete
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
      nieuweFilternaam: '',
      zoekTerm: '',
      geselecteerdeFilter: null,
      geselecteerdeFilters: [],

    }
  },

  methods: {
    veranderFilter(event) {
      this.$emit('veranderFilter', event.value.value);
    },
    filterOpslaan() {
      this.filterOpslaanMode = false;
      return this.$emit('filterOpslaan', this.zoekTerm, this.filterDelen, (this.geselecteerdeFilter && this.geselecteerdeFilter.value.id) ? this.geselecteerdeFilter.value.id : null);
    },
    selecteerCriterium(criterium) {
      this.$emit('activateCriterium', criterium);
    },

    deactivateCriterium(criterium) {
      this.$emit('deactivateCriterium', criterium)

    },

    setNonActieveKolom() {
      this.$emit('setNonActieveKolom');
    },

    setActieveKolom() {
      this.$emit('setActieveKolom');
    },

    filterToepassen() {
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
  },

  created() {
    this.emitter.on('deactivateCriterium', (event) => {
      this.deactivateCriterium(event.criteria);
    })
  },
  computed: {
    inActivecriteria() {
      return this.criteria.arrCriteria.filter(crit => {
        return !crit.activated
      });
    },
    activeCriteriaArray() {
      return this.activeCriteria;
    },
    opslaanLabel() {
      return (this.geselecteerdeFilter && this.geselecteerdeFilter.value.id) ? 'Overschrijven' : 'Opslaan';
    }
  },
}
</script>

<style scoped>

</style>

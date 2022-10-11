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
        <input-text v-model="nieuweFilternaam" placeholder="Filternaam" v-if="filterOpslaanMode"
                    class="ml-2"></input-text>
        <Opslaan title="Filter opslaan" @opslaan="filterOpslaan" v-if="filterOpslaanMode" class="ml-2"></Opslaan>
        <Button :label="filterOpslaanMode ? 'Annuleren' : 'Filter opslaan'"
                :icon="filterOpslaanMode ? 'fas fa-ban' : 'fas fa-plus'" class="ml-2 opslaan-button"
                @click="filterOpslaanMode = !filterOpslaanMode"></Button>
        <Button label="Filter toepassen"
                :icon="'fas fa-check'" class="ml-2 opslaan-knop"
                @click="filterToepassen"></Button>
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
    GroepseigenGegevensSelect
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
      nieuweFilternaam: '',
    }
  },

  methods: {
    veranderFilter(event) {
      this.$emit('veranderFilter', event.value.value);
    },
    filterOpslaan() {
      return false;
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
    }
  },
}
</script>

<style scoped>

</style>

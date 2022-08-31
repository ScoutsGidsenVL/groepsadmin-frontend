<template>
  <accordion :activeIndex="1">
    <accordionTab header="Filter instellingen">
      <div class="row">
        <div class="col-10">
          <div class="d-flex justify-content-start">
            <dropdown @change="veranderFilter" :options="filters" option-label="label" option-group-label="label"
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
          </div>
        </div>
        <div class="col-2">
          <div class="d-flex justify-content-end">
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
        </div>
        <KolommenSelect :actieveKolommen="actieveKolommen" :nonActieveKolommen="nonActieveKolommen"
                        @setActieveKolom="setActieveKolom" @setNonActieveKolom="setNonActieveKolom"></KolommenSelect>
      </div>
    </accordionTab>
  </accordion>
</template>

<script>
import KolommenSelect from "@/components/filter/KolommenSelect";
import Opslaan from "@/components/buttons/Opslaan";
import CriteriaSelect from "@/components/filter/CriteriaSelect";
import BoolFilter from "@/components/filter/BoolFilter";
import OudLedenSelect from "@/components/filter/OudLedenSelect";
import GeslachtSelect from "@/components/filter/GeslachtSelect";

export default {
  name: "LedenlijstFilterblok",
  components: {
    GeslachtSelect,
    OudLedenSelect,
    BoolFilter,
    CriteriaSelect,
    KolommenSelect,
    Opslaan,
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

  created() {

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

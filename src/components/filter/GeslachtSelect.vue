<template>
  <div v-if="criteria && criteria.activated" v-click-outside="close">
    <div class="col-12 type-select-button kolom-select pointer" @click="toggleMenu = !toggleMenu">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left d-flex">
            <div>
              <label>{{ criteria.title }}: </label>
            </div>
            <div class="row">
              <label class="subtitle pointer text-align-left criteria-label cut-off-text">{{ label }}</label>
            </div>
          </div>
        </div>
        <div class="col-2">
          <verwijder-criteria :criteria="criteria" />
        </div>
      </div>
    </div>
    <div class="position-absolute z999 bg-white col-12 col-sm-6 col-lg-3 col-xl-2 filter-border" v-if="toggleMenu">
      <div v-for="( item, index ) in criteria.items" :key="index" class="d-flex align-content-start">
        <RadioButton :id="index" v-model="selectedOption" :value="item.value" @change="changeGeslachtCriterium"/>
        <label :for="index" class="ml-3">{{ item.label }} </label>
      </div>
    </div>
  </div>
</template>

<script>
import VerwijderCriteria from "@/components/buttons/VerwijderCriteria";

export default {
  name: "GeslachtSelect",
  components: {
    VerwijderCriteria
  },
  props: {
    criteria: {
      type: Object
    },
    value : {
      type: String
    }
  },
  data() {
    return {
      toggleMenu: false,
      selectedOption: null,
    }
  },
  mounted() {
    if (this.value) {
      this.selectedOption = this.value;
    } else {
      this.selectedOption = 'vrouw';
    }
    this.changeGeslachtCriterium();
  },
  methods: {
    close() {
      this.toggleMenu = false;
    },
    changeGeslachtCriterium() {
      this.emitter.emit('changeGeslachtCriterium', {'criteria': this.criteria, 'selectedOption': this.selectedOption})
    }
  },
  computed: {
    label() {
      return this.selectedOption === 'vrouw' ? 'Meisje' : this.selectedOption === 'man' ? 'Jongen' : 'Andere';
    }
  }
}
</script>

<style scoped>

</style>

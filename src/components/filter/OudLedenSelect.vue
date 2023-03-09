<template>
  <div v-if="criteria && criteria.activated" v-click-outside="close">
    <div class="col-12 type-select-button kolom-select cursor-pointer" @click="toggleMenu = !toggleMenu">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left d-flex">
            <div>
              <label>{{ criteria.title }}: </label>
            </div>
            <div class="row">
              <label class="subtitle cursor-pointer text-align-left criteria-label cut-off-text-filter">{{ label }}</label>
            </div>
          </div>
        </div>
        <div class="col-2">
          <verwijder-criteria :criteria="criteria" />
        </div>
      </div>
    </div>
    <div class="position-absolute z999 bg-white col-11 col-sm-6 col-lg-3 col-xl-2 filter-border" v-if="toggleMenu">
      <div v-for="( item, index ) in criteria.items" :key="index" class="d-flex align-content-start">
        <RadioButton :id="index" v-model="selectedOption" :value="item.value" @change="checkSelectedOption"/>
        <label :for="index" class="ml-3">{{ item.label }} </label>
      </div>
    </div>
  </div>
</template>

<script>
import VerwijderCriteria from "@/components/buttons/VerwijderCriteria";

export default {
  name: "OudLedenSelect",
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
    this.selectedOption = this.value;
    if (this.selectedOption === undefined) {
      this.selectedOption = true;
    }
  },
  methods: {
    deactivateCriterium(criteria) {
      this.$emit('deactivateCriterium', criteria);
    },

    close() {
      this.toggleMenu = false;
    },

    checkSelectedOption() {
      this.emitter.emit('changeOudLidCriterium', {'criteria': this.criteria, 'selectedOption': this.selectedOption})
    }
  },

  computed: {
    label() {
      return this.selectedOption === true ? 'oudlid' : this.selectedOption === "alles" ? 'Actief en Oudlid' : '';
    }
  }

}
</script>

<style scoped>

</style>

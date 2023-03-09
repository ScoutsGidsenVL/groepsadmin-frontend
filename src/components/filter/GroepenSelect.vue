<template>
  <div v-if="criteria && criteria.activated" v-click-outside="close">
    <div class="col-12 type-select-button kolom-select cursor-pointer" @click="toggleMenu = !toggleMenu">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left d-flex">
            <div>
              <label>{{ criteria.title }}:</label>
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
    <div class="position-absolute z999 bg-white col-11 col-sm-6 col-md-4 col-lg-3 col-xl-2 filter-border filter-height-select" v-if="toggleMenu">
      <div class="d-flex align-content-start">
        <checkbox id="alle" v-model="selecteerAlles" @change="selecteerAlleGroepen" :binary="true"/>
        <label for="alle" class="ml-3 text-align-left">Selecteer alle groepen</label>
      </div>
      <Divider/>
      <div v-for="( item, index ) in criteria.items" :key="index" class="d-flex align-content-start">
        <checkbox :id="index" v-model="selectedOptions" :value="item.value" @change="checkSelectedOption"/>
        <label :for="index" class="ml-3 text-align-left">{{ item.label }} </label>
      </div>
    </div>
  </div>
</template>

<script>

import VerwijderCriteria from "@/components/buttons/VerwijderCriteria";

export default {
  name: "GroepenSelect",
  components: {
    VerwijderCriteria
  },
  data() {
    return {
      toggleMenu: false,
      selecteerAlles: false,
      selectedOptions: [],
    }
  },
  props: {
    criteria: {
      type: Array
    },
    value: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  methods: {
    close() {
      this.toggleMenu = false;
    },
    checkSelectedOption() {
      this.selecteerAlles = this.selectedOptions.length === this.criteria.items.length;
      this.emitter.emit('changeGroepCriterium', {'criteria': this.criteria, 'selectedOptions': this.selectedOptions})
    },
    selecteerAlleGroepen() {
      if (this.selecteerAlles) {
        this.criteria.items.forEach((item) => {
          this.selectedOptions.push(item.value);
        })
      } else {
        this.selectedOptions = [];
      }
      this.emitter.emit('changeGroepCriterium', {'criteria': this.criteria, 'selectedOptions': this.selectedOptions})
    },
  },
  mounted() {
    if (this.criteria && ( (this.criteria.items.length === this.value.length) || (this.value.length === 0) )) {
      this.selecteerAlles = true;
      if (this.selectedOptions.length === 0) {
        this.criteria.items.forEach((item) => {
          this.selectedOptions.push(item.value);
        })
      }
    } else if (this.value.length > 0 && (this.criteria.items.length !== this.value.length)) {
      this.criteria.items.forEach((item) => {
        this.value.forEach((groep) => {
          if (groep === item.value){
            this.selectedOptions.push(item.value);
          }
        })
      })
    }
  },
  computed: {
    label() {
      if (this.criteria && this.selectedOptions.length > 0) {
        let label = "";
        let counter = 0;
        this.criteria.items.forEach((item) => {
          this.selectedOptions.forEach((value) => {
            counter++;
            if (item.value === value) {
              label += item.label;
              if (counter !== this.selectedOptions.length) {
                label += ", "
              }
            }
          })
        })
        return label;
      }
      return "";
    }
  }

}
</script>

<style scoped>

</style>

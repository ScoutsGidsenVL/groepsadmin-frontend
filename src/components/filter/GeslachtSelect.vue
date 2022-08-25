<template>
  <div v-if="criteria && criteria.activated">
    <div class="col-12 type-select-button kolom-select" @click="toggleMenu = !toggleMenu" v-click-outside="close">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left  ">
            <div>
              <label class="ml-2">{{ criteria.title }}</label>
            </div>
            <div class="mt--05">
              <label class="ml-2 subtitle mt--05">{{ label }}</label>
            </div>
          </div>
        </div>
        <div class="col-2">
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-outlined p-button-danger remove-button"
            @click="
                                    $event.stopPropagation();
                                    deactivateCriterium(criteria);
                                  "
            title="Verwijder criterium"
          />
        </div>
      </div>
    </div>
    <div class="position-absolute z999 bg-white col-2 filter-border" v-if="toggleMenu">
      <div v-for="( item, index ) in criteria.items" :key="index" class="d-flex align-content-start">
        <RadioButton :id="index" v-model="selectedOption" :value="item.value" @change="changeGeslachtCriterium"/>
        <label :for="index" class="ml-3">{{ item.label }} </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GeslachtSelect",
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
    deactivateCriterium(criteria) {
      this.$emit('deactivateCriterium', criteria);
    },
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

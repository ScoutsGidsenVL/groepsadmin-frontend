<template>
  <div v-if="criteria && criteria.activated">
    <div class="col-12 type-select-button kolom-select" @click="toggleMenu = !toggleMenu" v-click-outside="close">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left d-flex">
            <div>
              <label class="label-width cursor-pointer">{{ criteria.title }}: </label>
            </div>
            <div class="row">
              <label class="subtitle cursor-pointer text-align-left criteria-label cut-off-text-filter">Ja</label>
            </div>
          </div>
        </div>
        <div class="col-2">
          <verwijder-criteria :criteria="criteria" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VerwijderCriteria from "@/components/buttons/VerwijderCriteria";

export default {
  name: "BoolFilter",
  components: {
    VerwijderCriteria
  },
  props: {
    activeCriteria: {
      type: Array
    },
    criteriaKey: {
      type: String
    }
  },
  methods: {
    close() {
      this.toggleMenu = false;
    }
  },
  computed: {
    criteria() {
      let selectedCriterium;
      this.activeCriteria.forEach(crit => {
        if (crit.criteriaKey === this.criteriaKey) {
          selectedCriterium = crit;
        }
      })
      return selectedCriterium;
    }
  }
}
</script>

<style scoped>

</style>

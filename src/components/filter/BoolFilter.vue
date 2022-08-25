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
              <label class="ml-2 subtitle mt--05">Ja</label>
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
  </div>
</template>

<script>
export default {
  name: "BoolFilter",
  props: {
    activeCriteria: {
      type: Array
    },
    criteriaKey: {
      type: String
    }
  },
  methods: {
    deactivateCriterium(criteria) {
      this.$emit('deactivateCriterium', criteria);
    },
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

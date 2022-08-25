<template>
  <div v-if="criteria && criteria.activated">
    <div class="col-12 type-select-button kolom-select" @click="toggleMenu = !toggleMenu" v-click-outside="close">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left  ">

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
  name: "GroepenSelect",
  data() {
    return {
      toggleMenu: false,
      selectedOption: [],
    }
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
    deactivateCriterium(criteria) {
      this.$emit('deactivateCriterium', criteria);
    },
    close() {
      this.toggleMenu = false;
    }
  },

}
</script>

<style scoped>

</style>

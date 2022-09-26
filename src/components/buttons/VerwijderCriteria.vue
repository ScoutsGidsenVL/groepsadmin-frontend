<template>
  <Button
    icon="pi pi-trash"
    class="p-button-rounded p-button-text p-button-danger mt--05 ml--05"
    @click="
                                    $event.stopPropagation();
                                    deactivateCriterium(criteria);
                                  "
    title="Verwijder criterium"
  />
</template>

<script>
export default {
  name: "VerwijderCriteria",
  props: {
    criteria : {
      type: Array
    }
  },
  methods: {
    deactivateCriterium(criteria) {
      this.emitter.emit('deactivateCriterium', {'criteria': criteria})
    }
  }
}
</script>

<style scoped>

</style>

<template>
  <Button icon="pi pi-save" class="p-button-rounded opslaan-knop custom-knop" @click="opslaan"/>
</template>
<script>
export default {
  name: "Opslaan",
  methods: {
    opslaan() {
      this.$emit('opslaan');
    }
  }
}
</script>

<style scoped>

</style>
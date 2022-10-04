<template>
  <Button icon="pi pi-save" class=" opslaan-knop" @click="opslaan" label="Opslaan"/>
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

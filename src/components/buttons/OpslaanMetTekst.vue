<template>
  <Button icon="pi pi-save" class="p-button opslaan-knop " @click="opslaan" label="Opslaan"></Button>
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
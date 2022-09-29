<template>
  <Button icon="pi pi-save" class="p-button opslaan-knop " @click="opslaan" label="Opslaan" :disabled="!changes"></Button>
</template>
<script>
export default {
  name: "Opslaan",
  props: {
    changes: {
      type: Boolean,
    }
  },
  methods: {
    opslaan() {
      this.$emit('opslaan');
    }
  }
}
</script>

<style scoped>
</style>

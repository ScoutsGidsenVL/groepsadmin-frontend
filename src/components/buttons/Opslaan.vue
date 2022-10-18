<template>
  <Button icon="pi pi-save" class=" opslaan-knop" @click="opslaan" :label="label"/>
</template>
<script>
export default {
  name: "Opslaan",
  props: {
    label: {
      type: String,
      default: "Opslaan"
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

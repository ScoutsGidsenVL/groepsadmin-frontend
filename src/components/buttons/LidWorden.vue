<template>
  <Button class="algemene-lid-knop" title="Lid worden" @click="opslaan" :disabled="disabled" >Lid worden</Button>
</template>

<script>
export default {
  name: "NieuwLid",
  props: {
    disabled: {
      type: Boolean
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
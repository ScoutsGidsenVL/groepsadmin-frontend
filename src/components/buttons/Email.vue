<template>
  <Button icon="fas fa-envelope" class="p-button-rounded algemene-knop custom-knop" title="Mail sturen" @click="mail" :disabled="!isLidGeladen"/>
</template>

<script>

export default {
  name: "Email",
  props: {
    lid: {
      type: Object
    }
  },
  methods: {
    mail() {
      if (this.isLidGeladen) {
        this.$router.push({name: "Mail"});
      }
    }
  },
  computed: {
    isLidGeladen() {
      return this.lid;
    }
  }
}
</script>

<style scoped>

</style>

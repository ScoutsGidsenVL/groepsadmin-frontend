<template>
  <div class="container-fluid md:w-90 d-flex justify-content-end position-absolute  mt-2 z999">
    <label class="h-1rem">{{ getVolledigeNaam }}</label>
    <div class="ml-4 clickable" @click="gaNaarAccount">
      <i class="fas fa-user-circle menu-icon" title="Account"/>
    </div>
    <div class="ml-5 clickable" @click="logout">
      <i class="fas fa-sign-out-alt menu-icon" title="Uitloggen"/>
    </div>
  </div>
</template>

<script>
export default {
  name: "IngelogdLid",
  data() {
    return {
      ingelogdLid: null
    }
  },
  computed: {
    getVolledigeNaam() {
      if (this.$store.getters.profiel) {
        return this.$store.getters.profiel.vgagegevens.voornaam + " " + this.$store.getters.profiel.vgagegevens.achternaam;
      } else {
        return "";
      }
    }
  },
  methods: {
    gaNaarAccount() {
      this.$toast.add({
        severity: "warn",
        summary: "Account",
        detail: "Nog niet geimplementeerd",
        life: 8000,
      });
    },
    logout() {
      this.$toast.add({
        severity: "warn",
        summary: "Logout",
        detail: "Nog niet geimplementeerd",
        life: 8000,
      });
    }
  }
}
</script>

<style scoped>

</style>
<template>
  <div class="hidden lg:block">
    <div class="container-fluid md:w-90 position-absolute mt-4 z999">
      <div class="d-flex justify-content-md-end">
        <label class="h-1rem float-start sm:ml-4 h-2rem clickable"
               @click="gaNaarProfiel">{{ getVolledigeNaam }}</label>
        <div class="ml-4 clickable" @click="gaNaarAccount" v-show="false">
          <i class="fas fa-user-circle menu-icon" title="Account"/>
        </div>
        <div class="ml-5 clickable" @click="logout">
          <i class="fas fa-sign-out-alt menu-icon " title="Uitloggen"/>
        </div>
      </div>
      <div class="d-flex justify-content-md-end">
        <lid-zoek-auto-complete/>
      </div>
    </div>
  </div>
</template>

<script>
import LidZoekAutoComplete from "@/components/global/LidZoekAutoComplete";

export default {
  name: "IngelogdLid",
  components: {
    LidZoekAutoComplete
  },
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
    },
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
    gaNaarProfiel() {
      this.$router.push({name: "Lid", params: {id: "profiel"}});
    },
    logout() {
      this.$keycloak.logout();
    }
  }
}
</script>

<style scoped>

</style>

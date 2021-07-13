<template>
  <div class="logout-block clickable" @click="logout">
    <span>
      <i class="fas fa-sign-out-alt" />
      <span class="logout">Afmelden</span>
    </span>
  </div>
</template>

<script>
export default {
  name: "Logout",
  methods: {
    logout() {
      this.$keycloak.logout();
    },
  },
};
</script>

<style scoped></style>

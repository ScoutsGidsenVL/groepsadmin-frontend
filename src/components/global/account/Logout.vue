<template>
  <div class="logout-block pointer" @click="logout">
    <span>
      <i class="fas fa-sign-out-alt" />
      <span class="bottom-0">Afmelden</span>
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

<template>
  <div class="user-block clickable">
    <span>
      <i class="fas fa-user" />
      <span class="username" @click="">{{ naam }}</span>
    </span>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "User",
  computed: {
    ...mapGetters(["naam"]),
  },
};
</script>

<style scoped></style>

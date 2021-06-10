<template>
  <div class="user-block">
    <span>
      <i class="fas fa-user" />
      <span class="username">{{ naam }}</span>
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

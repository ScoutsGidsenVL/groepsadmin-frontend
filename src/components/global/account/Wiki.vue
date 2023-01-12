<template>
  <div class="wiki-block cursor-pointer">
    <a @click="goto" target="_blank">
      <i class="fas fa-question" />
      <span class="help">Help</span>
    </a>
  </div>
</template>

<script>
import WikiService from "@/services/wiki/WikiService";

export default {
  name: "Help",
  methods: {
    goto() {
      let url = WikiService.getWikiUrl();
      window.open(url, "_blank");
    },
  },
};
</script>

<style scoped></style>

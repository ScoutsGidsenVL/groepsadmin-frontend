<template>
  <button
    type="button"
    class="thema-wissel cursor-pointer"
    :title="label"
    :aria-label="label"
    :aria-pressed="isDonker"
    @click="wissel"
  >
    <span
      :class="isDonker ? 'ga-kampvuur-aan' : 'ga-kampvuur-uit'"
      class="ga-kampvuur"
      aria-hidden="true"
    />
  </button>
</template>

<script>
import ThemaService from "@/services/thema/ThemaService";

export default {
  name: "ThemaWissel",
  computed: {
    isDonker() {
      return ThemaService.thema.value === "donker";
    },
    label() {
      return this.isDonker
        ? "Doof het kampvuur (lichte modus)"
        : "Steek het kampvuur aan (donkere modus)";
    },
  },
  methods: {
    wissel() {
      ThemaService.wissel();
    },
  },
};
</script>

<style scoped>
.thema-wissel {
  background: transparent;
  border: 0;
  padding: 0;
  color: inherit;
  line-height: 1;
  /* Flex, zodat het icoon niet op de tekstbasislijn zakt */
  display: flex;
  align-items: center;
}

/* De houtblokken zitten onderaan in de tekening. Iets omhoog, zodat de
   onderkant gelijk ligt met die van het afmeldicoon ernaast. */
.ga-kampvuur {
  transform: translateY(-12%);
}
</style>

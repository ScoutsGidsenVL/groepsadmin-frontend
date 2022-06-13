<template>
  <div class="groepseigen-gegeven-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> {{ title }}</span>
        </div>
      </template>
      <template #content>
          <div v-for="(geg, index) in gegVelden" :key="index" class="ml-2">
            <dynamisch-veld
              :veld="gegVelden[index]"
              :model-value="gegVelden[index]"
              :groepIndex="index"
              @changeValue="changeValue"
              class="groepseigengegevens"
            ></dynamisch-veld>
          </div>
      </template>
    </card>
  </div>
</template>

<script>
import DynamischVeldVoorAanvraag from "@/components/aanvraag/DynamischVeldVoorAanvraag";

export default {
  name: "GroepseigenGegevens",
  components: {
    DynamischVeld: DynamischVeldVoorAanvraag,
  },
  data() {
    return {
      gegevens: {}
    }
  },
  props: {
    title: {
      type: String,
    },
    modelValue: {
      type: Object, Array
    },
    groepsnummer: {
      type: String
    }
  },
  computed: {
    gegVelden() {
      return this.modelValue;
    },
    groepen() {
      return this.$store.getters.indexedGroepen;
    },
  },

  methods: {
    changeValue(veld, waarde) {
      this.gegVelden.forEach(geig => {
        geig.waarde = waarde;
      })
    },
  },
};
</script>

<style scoped></style>

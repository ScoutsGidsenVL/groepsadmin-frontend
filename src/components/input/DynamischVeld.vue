<template>
  <div>
    <div v-for="(veld, index) in schema" :key="index">
      <BaseInput
        v-if="veld.type === 'tekst'"
        v-model="waarde[veld.id]"
        :disabled="!veld.kanLidWijzigen && !veld.kanGebruikerWijzigen"
        :label="veld.label"
        :beschrijving="veld.beschrijving"
        @keyup="changeValue(veld.id, waarde[veld.id])"
        @changeValue="changeValue(veld.id, waarde[veld.id])"
        class="text-align-left"
        error-message="Gelieve dit veld in te vullen"
      >
      </BaseInput>
      <BaseCheckbox
        v-if="veld.type === 'vinkje'"
        v-model="waarde[veld.id]"
        :disabled="!veld.kanLidWijzigen && !veld.kanGebruikerWijzigen"
        :label="veld.label"
        :beschrijving="veld.beschrijving"
        @keyup="changeValue(veld.id, waarde[veld.id])"
        @changeValue="changeValue(veld.id, waarde[veld.id])"
        class="text-align-left"
      >
      </BaseCheckbox>
      <BaseDropdown
        v-if="veld.type === 'lijst'"
        v-model="waarde[veld.id]"
        :disabled="!veld.kanLidWijzigen && !veld.kanGebruikerWijzigen"
        :label="veld.label"
        :beschrijving="veld.beschrijving"
        @keyup="changeValue(veld.id, waarde[veld.id])"
        @changeValue="changeValue(veld.id, waarde[veld.id])"
        :options="vulOpties(veld.keuzes)"
        class="text-align-left"
      >
      </BaseDropdown>
      <BaseTextArea
        v-if="veld.type === 'tekst_meerdere_lijnen'"
        v-model="waarde[veld.id]"
        :beschrijving="veld.beschrijving"
        :disabled="!veld.kanLidWijzigen && !veld.kanGebruikerWijzigen"
        :label="veld.label"
        @keyup="changeValue(veld.id, waarde[veld.id])"
        @changeValue="changeValue(veld.id, waarde[veld.id])"
        class="text-align-left"
      >
      </BaseTextArea>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from "@vue/reactivity";
import BaseInput from "@/components/input/BaseInput";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import BaseDropdown from "@/components/input/BaseDropdown";
import BaseTextArea from "@/components/input/BaseTextArea";

export default {
  name: "DynamischVeld",
  components: {
    BaseTextArea,
    BaseInput,
    BaseCheckbox,
    BaseDropdown,
  },
  props: {
    modelValue: {
      type: [String, Number, Boolean],
    },
    veld: {
      type: Object,
    },
    groepIndex: {
      type: String,
    },
    errors: {
      type: Object,
    },
  },
  methods: {
    vulOpties(options) {
      let keuzes = [];
      options.forEach(function (optie) {
        keuzes.push({ label: optie, value: optie });
      });
      return keuzes;
    },
    changeValue(veld, waarde) {
      this.emitter.emit("changeGeg", {'veld': veld, 'waarde':waarde, 'groep':this.groepIndex});
    },
  },

  setup(props) {
    const state = reactive({
      schema: props.veld,
      waarde: props.modelValue,
    });

    return {
      ...toRefs(state),
    };
  },
};
</script>

<style scoped></style>

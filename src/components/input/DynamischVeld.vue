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
        :model-value="isChecked(veld.id)"
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
import {reactive, toRefs} from "@vue/reactivity";
import BaseInput from "@/components/input/BaseInput";
import BaseDropdown from "@/components/input/BaseDropdown";
import BaseTextArea from "@/components/input/BaseTextArea";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import mitt from "mitt";

export default {
  name: "DynamischVeld",
  components: {
    BaseTextArea,
    BaseInput,
    BaseCheckbox,
    BaseDropdown,
  },
  props: {
    modelValue: {},
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

  setup(props) {
    const emitter = mitt();

    const state = reactive({
      schema: props.veld,
      waarde: props.modelValue,
      keuzes: []
    });

    const isChecked = (id) => {
      return state.waarde[id] === "true" || state.waarde[id];
    }

    const changeValue = (veld, waarde) => {
      emitter.emit("changeGeg", {'veld': veld, 'waarde': waarde, 'groep': props.groepIndex});
    }

    const vulOpties = (options) => {
      options.forEach(function (optie) {
        state.keuzes.push({label: optie, value: optie});
      });
    }

    return {
      ...toRefs(state), isChecked, changeValue, vulOpties
    };
  },
};
</script>

<style scoped></style>

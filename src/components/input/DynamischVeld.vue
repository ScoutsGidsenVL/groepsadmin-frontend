<template>
  <div>
    <div v-for="(veld, index) in schema" :key="index">
      <BaseInput
        v-if="veld.type === 'tekst'"
        v-model="waarde[veld.id]"
        :disabled="(steekkaart && !eigenProfiel) || (!veld.kanLidWijzigen && !veld.kanGebruikerWijzigen)"
        :label="veld.label"
        :beschrijving="veld.beschrijving"
        @keyup="changeValue(veld.id, waarde[veld.id])"
        @changeValue="changeValue(veld.id, waarde[veld.id])"
        class="text-align-left"
        :error-message="errors && errors[veld.id] && errors[veld.id].message ? errors[veld.id].message : null"
        :invalid="errors && errors[veld.id] && errors[veld.id].invalid"
      >
      </BaseInput>
      <div v-if="veld.type === 'vinkje'" class="d-flex justify-content-between mb-2">
        <label class="text-align-left clickable" :for="veld.id">{{ veld.label }}</label>
        <checkbox
          true-value="true"
          false-value="false"
          :binary="true"
          :input-id="veld.id"
          class="mr-2"
          v-model="waarde[veld.id]"
          :disabled="(steekkaart && !eigenProfiel) || (!veld.kanLidWijzigen && !veld.kanGebruikerWijzigen)"
          @keyup="changeValue(veld.id, waarde[veld.id])"
          @change="changeValue(veld.id, waarde[veld.id])"
        >
        </checkbox>
      </div>
      <BaseDropdown
        v-if="veld.type === 'lijst'"
        v-model="waarde[veld.id]"
        :disabled="(steekkaart && !eigenProfiel) || (!veld.kanLidWijzigen && !veld.kanGebruikerWijzigen)"
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
        :disabled="(steekkaart && !eigenProfiel) || (!veld.kanLidWijzigen && !veld.kanGebruikerWijzigen)"
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
import BaseInput from "@/components/input/BaseInput";
import BaseDropdown from "@/components/input/BaseDropdown";
import BaseTextArea from "@/components/input/BaseTextArea";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import DynamischVeldService from "@/services/dynamischVeld/DynamischVeldService";
import {toRefs} from "@vue/reactivity";

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
    steekkaart: {
      default: false,
      type: Boolean
    },
    eigenProfiel: {
      default: false,
      type: Boolean
    }
  },

  setup(props) {
    const {
      state,
      isChecked,
      changeValue,
      vulOpties
    } = DynamischVeldService.dynamischVeldSpace(props)

    return {
      ...toRefs(state), isChecked, changeValue, vulOpties
    };
  },
};
</script>

<style scoped></style>

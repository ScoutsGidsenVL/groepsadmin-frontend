<template>
  <div>
    <BaseDropdown
      :options="landen"
      label="Land"
      v-model="adres.land"
      @changeValue="veranderLand"
      :disabled="disabled"
      v-if="showLand"
    />
    <gemeente-zoek-auto-complete
      label="Woonplaats"
      :modelValue="adres"
      v-if="adres.land === 'BE'"
      :disabled="disabled"
      :invalid="errors.gemeente.invalid"
      :error-message="errors.gemeente.message"
      @blur="touchField('gemeente')"
    />
    <straat-zoek-auto-complete
      :disabled="(!adres.postcode && !adres.gemeente) || disabled"
      label="Straat"
      :modelValue="adres"
      v-if="adres.land === 'BE'"
      :invalid="errors.straat.invalid"
      :error-message="errors.straat.message"
      @blur="touchField('straat')"
    />
    <BaseInput
      v-if="adres.land !== 'BE'"
      :disabled="disabled"
      label="Postcode"
      v-model="adres.postcode"
      type="text"
      :invalid="errors.postcode.invalid"
      :error-message="errors.postcode.message"
      @blur="touchField('postcode')"
    />
    <BaseInput
      v-if="adres.land !== 'BE'"
      label="Gemeente"
      v-model="adres.gemeente"
      type="text"
      :disabled="disabled"
      :invalid="errors.gemeente.invalid"
      :error-message="errors.gemeente.message"
      @blur="touchField('gemeente')"
    />
    <BaseInput
      v-if="adres.land !== 'BE'"
      label="Straat"
      v-model="adres.straat"
      :disabled="disabled"
      type="text"
      :invalid="errors.straat.invalid"
      :error-message="errors.straat.message"
      @blur="touchField('straat')"
    />
    <BaseInput
      label="Nummer"
      v-model="adres.nummer"
      :disabled="!adres.straat || disabled"
      type="text"
      :invalid="errors.nummer.invalid"
      :error-message="errors.nummer.message"
      @keyup="capitalize('nummer')"
      @blur="touchField('nummer')"
    />
    <BaseInput
      label="Bus"
      v-model="adres.bus"
      :disabled="!adres.nummer || disabled"
      type="text"
      :invalid="errors.bus.invalid"
      :error-message="errors.bus.message"
      @keyup="capitalize('bus')"
      @blur="touchField('bus')"
    />
  </div>
</template>

<script>
import BaseDropdown from "@/components/input/BaseDropdown";
import GemeenteZoekAutoComplete from "@/components/adres/GemeenteZoekAutoComplete";
import StraatZoekAutoComplete from "@/components/adres/StraatZoekAutoComplete";
import BaseInput from "@/components/input/BaseInput";
import { useVuelidate } from "@vuelidate/core";
import { alphaNum, helpers, required, requiredIf } from "@vuelidate/validators";

export default {
  name: "AdresVelden",
  components: {
    BaseDropdown,
    BaseInput,
    GemeenteZoekAutoComplete,
    StraatZoekAutoComplete,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showLand: {
      type: Boolean,
      default: true,
    },
    required: {
      type: Boolean,
      default: true,
    },
    landen: {
      type: Array,
      default: () => [
        { label: "België", value: "BE" },
        { label: "Duitsland", value: "DE" },
        { label: "Frankrijk", value: "FR" },
        { label: "Groot-Brittannië", value: "GB" },
        { label: "Luxemburg", value: "LU" },
        { label: "Nederland", value: "NL" },
        { label: "Canada", value: "CA" },
        { label: "Polen", value: "PL" },
      ],
    },
  },
  setup(props) {
    const modelValueRules = {
      straat: {
        required: helpers.withMessage(
          "Straat is verplicht",
          requiredIf(() => !!props.modelValue.gemeente)
        ),
      },
      nummer: {
        required: helpers.withMessage(
          "Nummer is verplicht",
          requiredIf(() => !!props.modelValue.straat)
        ),
      },
      bus: {
        alphaNum: helpers.withMessage(
          "Bus mag enkel letters en cijfers bevatten",
          alphaNum
        ),
      },
    };
    if (props.required) {
      modelValueRules.land = {
        required: helpers.withMessage("Land is verplicht", required),
      };
      modelValueRules.postcode = {
        required: helpers.withMessage("Postcode is verplicht", required),
      };
      modelValueRules.gemeente = {
        required: helpers.withMessage("Gemeente is verplicht", required),
      };
    }
    const v$ = useVuelidate({ modelValue: modelValueRules }, props);
    return { v$ };
  },
  created() {
    if (!this.showLand) {
      this.$watch(
        () => this.modelValue,
        (adres) => {
          if (adres && adres.land !== "BE") adres.land = "BE";
        },
        { immediate: true }
      );
    }
  },
  computed: {
    adres() {
      return this.modelValue;
    },
    errors() {
      const result = {};
      const showAll = this.v$.$dirty;
      for (const field of ["postcode", "gemeente", "straat", "nummer", "bus"]) {
        const f = this.v$.modelValue && this.v$.modelValue[field];
        if (!f) {
          result[field] = { invalid: false, message: "" };
          continue;
        }
        const visible = f.$dirty || showAll;
        const invalid = !!(visible && f.$invalid);
        const errs = f.$silentErrors || f.$errors;
        result[field] = {
          invalid,
          message: invalid && errs.length ? errs[0].$message : "",
        };
      }
      return result;
    },
  },
  methods: {
    touchField(field) {
      const f = this.v$.modelValue && this.v$.modelValue[field];
      if (f) f.$touch();
    },
    veranderLand() {
      this.adres.postcode = "";
      this.adres.gemeente = "";
      this.adres.straat = "";
      this.adres.nummer = "";
      this.adres.bus = "";
      this.v$.$reset();
    },
    capitalize(field) {
      if (this.adres[field]) {
        this.adres[field] = this.adres[field].toUpperCase();
      }
    },
  },
};
</script>

<style scoped></style>

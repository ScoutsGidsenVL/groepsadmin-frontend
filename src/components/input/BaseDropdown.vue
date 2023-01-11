<template>
  <div>
    <div class="p-grid row">
      <label
        class="col-12 col-sm-5 p-mb-2 p-mb-md-0 sm:mt-3"
        v-html="label"
        v-if="label"
      >
      </label>
      <div class="col-12 col-sm-7 p-md-8" :class="!label ? 'ml-4' : ''">
        <dropdown
          class="w-100"
          :options="options"
          :modelValue="value"
          optionLabel="label"
          optionValue="value"
          @change="changeValue"
          :disabled="disabled"
        />
      </div>
    </div>
    <p class="beschrijving" v-html="beschrijving" v-if="beschrijving"></p>
  </div>
</template>
<script>
import { useModelWrapper } from "@/utils/modelWrapper";

export default {
  name: "BaseDropdown",
  props: {
    label: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    modelValue: {
      type: [String, Number],
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    beschrijving: {
      type: String,
    },
    bold: {
      type: Boolean,
    },
    invalid: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
    },
  },
  methods: {
    changeValue($event) {
      this.$emit("update:modelValue", $event.value);
      this.$emit("changeValue", $event.value);
    },
  },
  setup(props, { emit }) {
    return {
      value: useModelWrapper(props, emit, "modelValue"),
    };
  },
};
</script>

<style scoped></style>

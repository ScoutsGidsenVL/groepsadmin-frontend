<template>
  <div>
    <div class="d-flex">
      <div class="mt-1 mb-4">
        <checkbox
          v-bind="$attrs"
          :modelValue="value"
          :disabled="disabled"
          :binary="multiple"
          @change="check"
        />
      </div>
      <div class="flex-1 mt-1">
        <label class="p-col-4 p-mb-2 p-mb-md-0 ml-2 checkbox-label"> {{ label }} </label>
      </div>
    </div>
  </div>
</template>

<script>
import { useModelWrapper } from "@/utils/modelWrapper";

export default {
  name: "BaseCheckbox",
  props: {
    label: {
      type: String,
      default: "",
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    helpLink: {
      type: String,
      default: null,
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
    check() {
      this.$emit("check");
      this.$emit("changeValue");
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

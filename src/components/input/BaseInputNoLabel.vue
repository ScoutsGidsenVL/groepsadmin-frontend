<template>
  <div class="col-12 col-sm-2 col-md-7 p-md-8">
    <inputText
      class="w-100"
      v-bind="$attrs"
      v-model="value"
      :disabled="disabled"
      :placeholder="placeholder"
      @change="changeValue"
      @keypress="keypress"
    />
  </div>
</template>

<script>
import {useModelWrapper} from "@/utils/modelWrapper";

export default {
  name: "BaseInputNoLabel",
  props: {
    placeholder: {
      type: String,
      default: "",
    },
    modelValue: {
      type: [String, Number],
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    changeValue($event) {
      this.$emit("update:modelValue", $event.target.value);
      this.$emit("changeValue");
    },
    keypress() {
      this.$emit("keypress");
    }
  },
  setup(props, {emit}) {
    return {
      value: useModelWrapper(props, emit, "modelValue"),
    };
  },
};
</script>

<style scoped></style>

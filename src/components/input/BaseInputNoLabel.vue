<template>
  <div class="p-grid row">
    <div class="col-12 col-sm-2 p-md-8">
      <inputText
        v-bind="$attrs"
        v-model="value"
        :disabled="disabled"
        :placeholder="placeholder"
      />
    </div>
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
      default: false
    }
  },
  setup(props, { emit }) {
    return {
      value:  useModelWrapper(props, emit, 'modelValue')   }
  }
};
</script>

<style scoped></style>

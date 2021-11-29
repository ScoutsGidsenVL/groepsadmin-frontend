<template>
  <div>
    <div class="p-grid row">
      <label class="col-12 col-sm-5 p-mb-2 p-mb-md-0 mt-3"> {{ label }} </label>
      <div class="col-12 col-sm-7 p-md-8">
        <Textarea
          class="w-100"
          v-bind="$attrs"
          v-model="value"
          :disabled="disabled"
          :placeholder="placeholder"
          @change="changeValue"
        />
      </div>
    </div>
    <p class="beschrijving" v-html="beschrijving" v-if="beschrijving"></p>
  </div>
</template>

<script>
import { useModelWrapper } from "@/utils/modelWrapper";
import Textarea from "primevue/textarea";

export default {
  name: "BaseTextArea",
  components: {
    Textarea,
  },
  props: {
    label: {
      type: String,
      default: "",
    },
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
      this.$emit("update:modelValue", $event.target.value);
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

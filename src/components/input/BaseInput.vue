<template>
  <div>
    <div class="p-grid row">
      <label class="col-12 col-sm-4 p-mb-2 p-mb-md-0 mt-3">
        {{ label }}
        <span class="help-button-wrapper">
          <a :href="helpLink" target="_blank"
            ><i
              class="fas fa-question-circle help-button ml-2"
              v-if="helpLink"
              title="Meer info..."
            ></i></a
        ></span>
      </label>
      <div
        class="col-12 col-sm-8 p-md-8"
        :class="bold ? 'font-weight-bolder' : ''"
      >
        <inputText
          class="w-100"
          v-bind="$attrs"
          v-model="value"
          :disabled="disabled"
          :placeholder="placeholder"
          @change="changeValue"
          :class="invalid ? 'p-invalid' : ''"
        />
      </div>
    </div>
    <div class="row">
      <p
        class="beschrijving col-12 col-sm-4"
        v-html="beschrijving"
        v-if="beschrijving"
      ></p>
      <small
        class="p-invalid col-12 col-sm-8 p-error"
        v-if="invalid"
        :class="!beschrijving ? 'offset-sm-4' : ''"
        >{{ errorMessage }}
      </small>
    </div>
  </div>
</template>

<script>
import { useModelWrapper } from "@/utils/modelWrapper";

export default {
  name: "BaseInput",
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
    helpLink: {
      type: String,
      default: null,
    },
  },
  methods: {
    changeValue($event) {
      this.$emit("update:modelValue", $event.target.value);
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

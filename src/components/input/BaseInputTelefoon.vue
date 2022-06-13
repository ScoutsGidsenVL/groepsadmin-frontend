<template>
  <div>
    <div class="p-grid row">
      <label class="col-12 col-sm-5 p-mb-2 p-mb-md-0 sm:mt-3">
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
        class="col-12 col-sm-7 p-md-8"
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
        :class="!beschrijving ? 'offset-sm-5' : ''"
        >{{ errorMessage }}
      </small>
    </div>
  </div>
</template>

<script>
import { useModelWrapper } from "@/utils/modelWrapper";
import Telefoonnummer from "@/services/google/Telefoonnummer";

export default {
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
      let phone = Telefoonnummer.formatNumber($event.target.value);
      this.$emit("update:modelValue", phone);
      this.$emit("changeValue", phone);
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

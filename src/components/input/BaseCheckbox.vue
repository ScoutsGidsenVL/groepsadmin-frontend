<template>
  <div class="custom-checkbox">
    <div class="row">
      <div class="col-9 col-sm-5 p-mb-2 p-mb-md-0">
        <label> {{ label }} </label>
      </div>
      <div class="col-2 col-sm-7">
        <checkbox
          class="ml-1"
          v-bind="$attrs"
          :modelValue="value"
          :disabled="disabled"
          :binary="multiple"
          @change="check"
        />
        <span class="help-button-wrapper">
          <a :href="helpLink" target="_blank"
            ><i
              class="fas fa-question-circle help-button ml-2"
              v-if="helpLink"
              title="Meer info..."
            ></i
          ></a>
        </span>
      </div>
    </div>
    <p class="beschrijving" v-html="beschrijving" v-if="beschrijving"></p>
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
      type: String,
      default: "false",
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

    showMessage() {
      console.log("KABOEM");
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

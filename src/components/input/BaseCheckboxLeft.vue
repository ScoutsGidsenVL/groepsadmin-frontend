<template>
  <div>
    <div class="p-grid row">
      <div class="mt-1 ml-25 mr-3">
        <checkbox
          class="ml-1"
          v-bind="$attrs"
          :modelValue="value"
          :disabled="disabled"
          :binary="multiple"
          @change="check"
        />
        <span class="help-button-wrapper">
          <i class="fas fa-question-circle help-button ml-2" v-if="helpLink" title="Meer info..."><a :href="helpLink" target="_blank"></a></i>
        </span>
      </div>
      <label class="p-col-4 p-mb-2 p-mb-md-0"> {{ label }} </label>
    </div>
    <p class="beschrijving" v-html="beschrijving" v-if="beschrijving"></p>
  </div>
</template>

<script>
import {useModelWrapper} from "@/utils/modelWrapper";

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
      default: false
    },
    helpLink: {
      type: String,
      default: null
    },
    beschrijving: {
      type: String
    },
    bold: {
      type: Boolean
    },
    invalid: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String
    }
  },
  methods: {
    check() {
      this.$emit('check');
      this.$emit('changeValue');
    },
  },
  setup(props, {emit}) {
    return {
      value: useModelWrapper(props, emit, 'modelValue')
    }
  }
};
</script>

<style scoped></style>

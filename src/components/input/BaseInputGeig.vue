<template>
  <div>
    <div class="p-grid row">
      <div
        class="col-8 p-md-8"
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
      <div class="col-4">
        <Button
          v-if="!disabled"
          icon="pi pi-trash"
          class="p-button-rounded p-button-outlined p-button-danger float-end mr-1"
          @click="
                    $event.stopPropagation();
                    remove(index);
                  "
          :title="'Verwijder groepseigen functie ' + value"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {useModelWrapper} from "@/utils/modelWrapper";

export default {
  name: "BaseInputGeig",
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
    invalid: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
    },
    index: {
      type: String
    }
  },
  methods: {
    changeValue($event) {
      this.$emit("update:modelValue", $event.target.value);
      this.$emit("changeValue");
    },
    remove(index) {
      this.$emit("remove", index);
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

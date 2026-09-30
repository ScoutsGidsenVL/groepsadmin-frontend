<template>
  <div class="geig-rij">
    <div class="flex-grow-1" :class="bold ? 'font-weight-bolder' : ''">
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
    <div class="geig-iconen">
      <Button
        v-if="toonOpslaan"
        icon="pi pi-save"
        :loading="bezigMetOpslaan"
        class="p-button-rounded p-button-outlined geig-opslaan-knop geig-icoon-knop"
        @click="
          $event.stopPropagation();
          opslaan();
        "
        :title="'Bewaar groepseigen functie ' + value"
      />
      <Button
        v-if="!disabled"
        icon="pi pi-trash"
        class="p-button-rounded p-button-outlined p-button-danger geig-icoon-knop"
        @click="
          $event.stopPropagation();
          remove(index);
        "
        :title="'Verwijder groepseigen functie ' + value"
      />
    </div>
  </div>
</template>

<script>
import { useModelWrapper } from "@/utils/modelWrapper";

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
      type: String,
    },
    toonOpslaan: {
      type: Boolean,
      default: false,
    },
    bezigMetOpslaan: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    changeValue($event) {
      this.$emit("update:modelValue", $event.target.value);
      this.$emit("changeValue");
    },
    remove(index) {
      this.$emit("remove", index);
    },
    opslaan() {
      this.$emit("opslaan", this.index);
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

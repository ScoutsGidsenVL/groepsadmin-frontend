<template>
  <div class="row">
    <label for="icon" class="col-12 col-sm-5 p-mb-2 p-mb-md-0 mt-3">
      {{ label }}
    </label>
    <div class="col-12 col-sm-7 p-md-8">
      <Calendar
        autocomplete="off"
        id="icon"
        :showIcon="true"
        dateFormat="dd/mm/yy"
        :monthNavigator="true"
        :yearNavigator="true"
        yearRange="1900:2040"
        :manualInput="false"
        v-bind="$attrs"
        :modelValue="new Date(modelValue)"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
  </div>
</template>
<script>
import Calendar from "primevue/calendar";

export default {
  name: "DatePicker",
  components: {
    Calendar,
  },
  props: {
    label: {
      type: String,
      default: "",
    },
    modelValue: {
      type: [Date, String],
      default: new Date(),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>

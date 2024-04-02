<template>
  <div class="row">
    <label for="icon" class="col-12 col-sm-5 p-mb-2 p-mb-md-0 sm:mt-3">
      {{ label }}
    </label>

    <div class="col-12 col-sm-7 p-md-8">
      <Calendar
        autocomplete="off"
        :showOnFocus="false"
        id="icon"
        :showIcon="true"
        dateFormat="dd/mm/yy"
        placeholder="../../...."
        :manualInput=true
        v-bind="$attrs"
        :modelValue="modelValue"
        :disabled="disabled"
        :class="invalid ? 'p-invalid' : ''"
      >
      </Calendar>
    </div>
    <div class="row ml-1">
      <small
        class="p-invalid col-12 col-sm-8 p-error offset-sm-5"
        v-if="invalid"
      >{{ errorMessage }}
      </small>
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
      type: Date,
      default: new Date(new Date().setFullYear(new Date().getFullYear() - 5))
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    invalid: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String
    }
  },
};
</script>

<style scoped></style>

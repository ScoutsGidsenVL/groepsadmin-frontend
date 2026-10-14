<template>
  <div class="uittreksel-strafregister-card mb-4">
    <card>
      <template #title>
        <span class="font22">{{ title }}</span>
      </template>
      <template #content>
        <div class="p-fluid mt-2">
          <BaseDropdown
            v-model="status"
            :options="statusOpties"
            label="Status"
          />
          <date-picker v-model="datum" label="Datum" />
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import { ref } from "vue";
import BaseDropdown from "@/components/input/BaseDropdown";
import DatePicker from "@/components/input/DatePicker";

export default {
  name: "UittrekselStrafregister",
  components: {
    BaseDropdown,
    DatePicker,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  setup() {
    const statusOpties = [
      { label: "Nog op te vragen", value: "nog_op_te_vragen" },
      { label: "Ontvangen", value: "ontvangen" },
      { label: "In orde", value: "in_orde" },
      { label: "Verlopen", value: "verlopen" },
    ];
    const status = ref("nog_op_te_vragen");
    const datum = ref(null);

    return { statusOpties, status, datum };
  },
};
</script>

<style scoped></style>

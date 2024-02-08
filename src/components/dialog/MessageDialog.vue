<template>
  <Dialog
    :header="header"
    v-model:visible="openDialog"
    :style="{ width: '550px' }"
    :modal="true"
    :closable="false"
  >
    <div class="confirmation-content">
      <span v-html="message"></span>
      <div v-if="leden?.length > 0">
        <div v-for="(lid, index) in leden" :key="index">
          <router-link :to="{ name:'Lid', params: { id: lid.id }}">
            {{ lid.voornaam }} {{ lid.achternaam }} - {{ formatteerDatum(lid.geboortedatum) }}
          </router-link>
        </div>
      </div>
    </div>
    <template #footer>
      <Button
        label="Begrepen"
        icon="pi pi-check"
        @click="sluiten"
        class="p-button-text approve-button"

      />
    </template>
  </Dialog>
</template>

<script>
import DateUtil from "@/services/dates/DateUtil";

export default {
  name: "MessageDialog",
  props: {
    message: {
      type: String,
    },
    leden: {
      type: Array
    },
    header: {
      type: String,
      default: "Opgelet"
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    sluiten() {
      this.$emit("close");
    },
    formatteerDatum(datum) {
      return DateUtil.formatteerDatum(datum);
    },
  },
  computed: {
    openDialog() {
      return this.dialogVisible;
    },
  },
};
</script>

<style scoped></style>

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
    </div>
    <div>

    </div>
    <template #footer>
      <Button
        label="Nee"
        icon="pi pi-check"
        @click="annuleer"
        class="p-button-text cancel-button"
        autofocus
      />
      <Button
        label="Ja"
        icon="pi pi-times"
        @click="bevestig"
        class="p-button-text accept-button"
      />
    </template>
  </Dialog>
</template>

<script>
export default {
  name: "ConfirmDialog",
  props: {
    message: {
      type: String,
    },
    header: {
      type: String,
      default: "Bevestigen"
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    bevestig() {
      this.$emit("bevestigMail");
    },

    annuleer() {
      this.$emit("bevestigGeenMail");
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

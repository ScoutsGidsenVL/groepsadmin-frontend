<template>
  <Dialog
    header="Bevestigen"
    v-model:visible="openDialog"
    :style="{ width: '550px' }"
    :modal="true"
    :closable="false"
  >
    <div class="confirmation-content">
      <span v-html="message"></span>
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
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    bevestig() {
      this.$emit("confirm");
    },

    annuleer() {
      this.$emit("cancel");
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

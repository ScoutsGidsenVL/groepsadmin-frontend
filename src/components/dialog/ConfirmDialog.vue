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
    <template #footer>
      <Button
        label="Nee"
        icon="pi pi-times"
        @click="annuleer"
        class="p-button-text reject-button"

      />
      <Button
        label="Ja"
        icon="pi pi-check"
        @click="bevestig"
        class="p-button-text approve-button"
        autofocus
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
    type: {
      type: String
    }
  },
  methods: {
    bevestig() {
      this.$emit("confirm", this.type);
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

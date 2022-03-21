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
        label="Begrepen"
        icon="pi pi-check"
        @click="sluiten"
        class="p-button-text approve-button"

      />
    </template>
  </Dialog>
</template>

<script>
export default {
  name: "MessageDialog",
  props: {
    message: {
      type: String,
    },
    header: {
      type: String,
      default: "Opgelet"
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
    sluiten() {
      this.$emit("close");
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

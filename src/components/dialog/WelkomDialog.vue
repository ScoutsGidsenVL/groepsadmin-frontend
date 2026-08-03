<template>
  <Dialog
    v-model:visible="openDialog"
    :style="{ width: '550px' }"
    class="message-dialog welkom-dialog"
    :modal="true"
    :closable="false"
  >
    <template #header>
      <div class="welkom-dialog-header">
        <img
          :src="`${publicPath}static/img/ga-logo.svg`"
          alt="ga logo"
          class="welkom-dialog-logo"
        />
        <div class="welkom-dialog-titel">{{ header }}</div>
      </div>
    </template>
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
  name: "WelkomDialog",
  props: {
    message: {
      type: String,
    },
    header: {
      type: String,
      default: "Welkom!",
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
    };
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

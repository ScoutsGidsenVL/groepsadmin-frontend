<template>
  <Dialog
    header="Afmetingen voor etiketten"
    v-model:visible="openDialog"
    :style="{ width: '550px' }"
    :modal="true"
    :closable="false"
  >
    <div class="confirmation-content">
      <img
        :src="`${publicPath}static/img/etiketinfo.png`"
        class="img-fluid"
      />
    </div>
    <template #footer>
      <Button
        label="Sluiten"
        @click="sluiten"
        class="p-button-text approve-button"
      />
    </template>
  </Dialog>
</template>

<script>
export default {
  name: "EtiketInfoDialog",
  props: {
    message: {
      type: String,
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
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

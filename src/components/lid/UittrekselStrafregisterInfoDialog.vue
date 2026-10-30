<template>
  <Dialog
    header="Uittreksel strafregister opladen"
    v-model:visible="openDialog"
    :style="{ width: '550px' }"
    class="uittreksel-strafregister-info-dialog"
    :modal="true"
    :closable="false"
  >
    <p>
      Placeholder: hier komt binnenkort meer uitleg over het opladen van je
      uittreksel strafregister.
    </p>
    <div class="d-flex justify-content-center align-items-center gap-2">
      <checkbox
        v-model="geinformeerd"
        :binary="true"
        inputId="geinformeerd"
      ></checkbox>
      <label for="geinformeerd" class="cursor-pointer"
        >Ik ben geïnformeerd</label
      >
    </div>
    <template #footer>
      <Button
        label="Annuleer"
        icon="pi pi-times"
        @click="$emit('close')"
        class="p-button-text reject-button"
      />
      <Button
        label="Opladen"
        icon="pi pi-upload"
        :disabled="!geinformeerd"
        @click="$emit('opladen')"
        class="p-button-text approve-button"
      />
    </template>
  </Dialog>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "UittrekselStrafregisterInfoDialog",
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "opladen"],
  setup(props) {
    const geinformeerd = ref(false);

    // Telkens de popup opnieuw geopend wordt moet het vinkje opnieuw
    // aangeduid worden
    watch(
      () => props.dialogVisible,
      (zichtbaar) => {
        if (zichtbaar) {
          geinformeerd.value = false;
        }
      }
    );

    return { geinformeerd };
  },
  computed: {
    openDialog() {
      return this.dialogVisible;
    },
  },
};
</script>

<style scoped></style>

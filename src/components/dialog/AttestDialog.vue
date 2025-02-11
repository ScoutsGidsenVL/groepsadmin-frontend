<template>
  <Loader></Loader>
  <Dialog
    v-model:visible="openDialog"
    :style="{
      width: '550px',
    }"
    class="activiteit-dialog"
    :modal="true"
    :closable="false"
  >
    <template #header>
      <div class="inline-flex align-items-center justify-content-start gap-2 header-background">
        <span class="font-bold white-space-nowrap">Fiscaal attest genereren</span>
      </div>
    </template>
    <div class="activiteit-content">
      <h4>Groep</h4>
      <BaseInput
        v-model="attest.kbo"
        label="KBO"
        type="text"
        :invalid="v.attest.kbo.$dirty && v.attest.kbo.$invalid"
        :error-message="v.attest.kbo.required.$message"
      />
      <h4>Certificerende instantie</h4>
      <BaseInput
        v-model="attest.certnaam"
        label="Naam"
        type="text"
        :invalid="v.attest.certnaam.$dirty && v.attest.certnaam.$invalid"
        :error-message="v.attest.certnaam.required.$message"
      />
      <BaseInput
        v-model="attest.certadres"
        label="Straat + nr"
        type="text"
        :invalid="v.attest.certadres.$dirty && v.attest.certadres.$invalid"
        :error-message="v.attest.certadres.required.$message"
      />
      <BaseInput
        v-model="attest.certpostcode"
        label="Postcode"
        type="text"
        :invalid="v.attest.certpostcode.$dirty && v.attest.certpostcode.$invalid"
        :error-message="v.attest.certpostcode.required.$message"
      />
      <BaseInput
        v-model="attest.certgemeente"
        label="Gemeente"
        type="text"
        :invalid="v.attest.certgemeente.$dirty && v.attest.certgemeente.$invalid"
        :error-message="v.attest.certgemeente.required.$message"
      />
      <BaseInput
        v-model="attest.certkbo"
        label="KBO (optioneel)"
        type="text"
      />
    </div>
    <template #footer>
      <Button
        label="Annuleer"
        icon="pi pi-times"
        @click="$emit('close')"
        class="p-button-text reject-button"
      />
      <Button
        label="Genereer Attest"
        @click="genereer"
        class="p-button-text approve-button"
      />
    </template>
  </Dialog>
</template>

<script>
import BaseInput from "@/components/input/BaseInput.vue";
import {toRefs} from "@vue/reactivity";
import Loader from "@/components/global/Loader.vue";
import ActiviteitenService from "@/services/activiteiten/ActiviteitenService";

export default {
  name: "MessageDialog",
  components: {
    Loader,
    BaseInput
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    groep: {
      type: Object
    }
  },
  methods: {
    genereer() {
      this.genereerAttest();
    },
  },

  setup(props) {
    const {
      state,
      v,
      openDialog,
      genereerAttest,
    } = ActiviteitenService.attestenDialogSpace(props);

    return {
      ...toRefs(state),
      v,
      openDialog,
      genereerAttest,
    }
  }
};
</script>

<style scoped>

</style>

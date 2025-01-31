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
        <span class="font-bold white-space-nowrap">Fiscaal Attest Genereren</span>
      </div>
    </template>
    <div class="activiteit-content">
      <h4>Groep</h4>
      <BaseInput
        v-model="attest.kbo"
        label="KBO"
        type="text"
      />
      <h4>Certificerende Instantie</h4>
      <BaseInput
        v-model="attest.certnaam"
        label="Naam"
        type="text"
      />
      <BaseInput
        v-model="attest.certadres"
        label="Straat + nr"
        type="text"
      />
      <BaseInput
        v-model="attest.certpostcode"
        label="Postcode"
        type="text"
      />
      <BaseInput
        v-model="attest.certgemeente"
        label="Gemeente"
        type="text"
      />
      <BaseInput
        v-model="attest.certkbo"
        label="KBO"
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
        @click="$emit('genereerAttest')"
        class="p-button-text"
      />
      <!--<Opslaan @opslaan="opslaan"></Opslaan>-->
    </template>
  </Dialog>
</template>

<script>
//import Opslaan from "@/components/buttons/Opslaan.vue";
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

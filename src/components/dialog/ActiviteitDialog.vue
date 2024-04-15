<template>
  <Loader
    :showLoader="activiteitOpslaan"
  ></Loader>
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
        <span class="font-bold white-space-nowrap">Activiteit toevoegen</span>
      </div>
    </template>
    <div class="activiteit-content">
      <date-picker
        v-model="activiteit.van"
        label="Van"
        :invalid="v.activiteit.van.$dirty && v.activiteit.van.$invalid"
        :error-message="v.activiteit.van.required.$message"
      />
      <date-picker
        v-model="activiteit.tot"
        label="Van"
        :invalid="v.activiteit.tot.$dirty && v.activiteit.tot.$invalid"
        :error-message="v.activiteit.tot.required.$message"
      />
      <BaseInput
        v-model="activiteit.omschrijving"
        :placeholder="'bv. Zomerkamp De Brink'"
        label="Omschrijving"
        type="text"
      />
      <div style="margin-top: 5px">
        <label style="margin-right: 11.40rem">Prijs</label>
        <InputNumber
          v-model="activiteit.prijs"
          label="Prijs"
          locale="nl-NL"
          :minFractionDigits="2"
          :invalid="v.activiteit.prijs.$dirty && v.activiteit.prijs.$invalid"
          :error-message="v.activiteit.prijs.required.$message"
        />
      </div>
      <div style="margin-top: 13px">
        <label style="margin-right: 9.55rem">Functies</label>
        <MultiSelect
          v-model="activiteit.functies"
          :options="gesorteerdeFuncties()"
          display="chip"
          optionLabel="beschrijving"
          placeholder="Selecteer de functies"
          class="w-full md:w-14rem"
        />
      </div>
    </div>
    <template #footer>
      <Button
        label="Annuleer"
        icon="pi pi-times"
        @click="$emit('close')"
        class="p-button-text reject-button"

      />
      <Opslaan @opslaan="opslaan"></Opslaan>
    </template>
  </Dialog>
</template>

<script>
import Opslaan from "@/components/buttons/Opslaan.vue";
import DatePicker from "@/components/input/DatePicker.vue";
import BaseInput from "@/components/input/BaseInput.vue";
import {toRefs} from "@vue/reactivity";
import MultiSelect from "primevue/multiselect";
import Loader from "@/components/global/Loader.vue";
import InputNumber from "primevue/inputnumber";
import ActiviteitenService from "@/services/activiteiten/ActiviteitenService";

export default {
  name: "MessageDialog",
  components: {
    Loader,
    BaseInput,
    DatePicker,
    Opslaan,
    MultiSelect,
    InputNumber
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    functies: {
      type: Array
    },
    groep: {
      type: Object
    },
    teBewerkenActiviteit: {
      type: Object
    }
  },

  setup(props) {
    const {
      state,
      v,
      openDialog,
      formatteerDatum,
      opslaan,
      gesorteerdeFuncties
    } = ActiviteitenService.activiteitenDialogSpace(props);

    return {
      ...toRefs(state),
      v,
      openDialog,
      formatteerDatum,
      opslaan,
      gesorteerdeFuncties
    }
  }
};
</script>

<style scoped>

</style>

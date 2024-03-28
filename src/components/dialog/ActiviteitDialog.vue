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
          :options="functies"
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
import DateUtil from "@/services/dates/DateUtil";
import Opslaan from "@/components/buttons/Opslaan.vue";
import DatePicker from "@/components/input/DatePicker.vue";
import BaseInput from "@/components/input/BaseInput.vue";
import {reactive, toRefs} from "@vue/reactivity";
import {helpers, minValue, required} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";
import {computed, watch} from "vue";
import {useToast} from "primevue/usetoast";
import MultiSelect from "primevue/multiselect";
import Loader from "@/components/global/Loader.vue";
import useEmitter from "@/services/utils/useEmitter";
import InputNumber from "primevue/inputnumber";
import RestService from "@/services/api/RestService";

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
    const toast = useToast();
    const emitter = useEmitter();

    const state = reactive({
      geselecteerdeFuncties: [],
      activiteit: {
        van: new Date(),
        tot: new Date(),
        omschrijving: "",
        prijs: 0,
        functies: [],
        groep: props.groep
      },
      defaultActiviteit: {
        van: new Date(),
        tot: new Date(),
        omschrijving: "",
        prijs: 0,
        functies: [],
        groep: props.groep
      },

      activiteitOpslaan: false
    });

    const rules = {
      activiteit: {
        van: {
          required: helpers.withMessage('Startdatum is verplicht', required)
        },
        tot: {
          required: helpers.withMessage('Einddatum is verplicht', required)
        },
        prijs: {
          required: helpers.withMessage('Prijs is verplicht', required),
          minValue: helpers.withMessage('Prijs mag niet 0 zijn', minValue(1))
        },
      },
    }

    const openDialog = computed(
      () => {
        return props.dialogVisible;
      },
    )

    watch(
      () => props.dialogVisible,
      () => {
        if (props.teBewerkenActiviteit) {
          state.activiteit = Object.assign({}, props.teBewerkenActiviteit);
          state.activiteit.functies = [];
          props.teBewerkenActiviteit.functies.forEach(activiteitsFunctie => {
            props.functies.forEach(functie => {
              if (activiteitsFunctie.id === functie.id) {
                state.activiteit.functies.push(functie);
              }
            })
          })
          state.activiteit.van = new Date(props.teBewerkenActiviteit.van);
          state.activiteit.tot = new Date(props.teBewerkenActiviteit.tot);
        } else {
          state.activiteit = Object.assign({}, state.defaultActiviteit);
        }
      },
      {deep: true}
    )

    const formatteerDatum = (datum) => {
      return DateUtil.formatteerDatum(datum);
    }

    const opslaan = () => {
      v.value.$touch();
      if (v.value.$invalid) {
        state.loading = false;
        toast.add({
          severity: "warn",
          summary: "Wijzigingen",
          detail: "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier.",
          life: 3000,
        });
        return;
      }

      state.isLoadingActiviteiten = true;
      state.activiteit.van = DateUtil.formatteerDatumVoorApi(state.activiteit.van);
      state.activiteit.tot = DateUtil.formatteerDatumVoorApi(state.activiteit.tot);
      state.activiteit.groep = props.groep;

      if (state.activiteit.id) {
        activiteitAanpassen();
      } else {
        activiteitOpslaan();
      }

      setTimeout(() => {
        state.activiteit = Object.assign({}, state.defaultActiviteit);
      }, 1000)
    }

    const activiteitOpslaan = () => {
      state.activiteitOpslaan = true;
      RestService.activiteitOpslaan(state.activiteit).then(res => {
        if (res.status === 200) {
          toast.add({
            severity: "success",
            summary: "Nieuwe activiteit",
            detail: "Nieuwe activiteit opgeslagen",
            life: 2000,
          });
        }
      }).finally(() => {
        state.activiteitOpslaan = false;
        emitter.emit('activiteitenOphalen')
      })
    }

    const activiteitAanpassen = () => {
      state.activiteitOpslaan = true;
      RestService.activiteitAanpassen(state.activiteit).then(res => {
        if (res.status === 200) {
          toast.add({
            severity: "success",
            summary: "Wijzigingen",
            detail: "Wijzigingen activiteit opgeslagen",
            life: 2000,
          });
        }
      }).finally(() => {
        state.activiteitOpslaan = false;
        emitter.emit('activiteitenOphalen')
      })
    }

    const v = useVuelidate(rules, state);
    return {
      ...toRefs(state),
      v,
      formatteerDatum,
      opslaan,
      openDialog
    };
  },
};
</script>

<style scoped>

</style>

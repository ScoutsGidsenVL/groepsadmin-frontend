<template>
  <div class="ml-4 mb-4">
    <card>
      <template #title> Algemeen</template>
      <template #content>
        <div class="p-fluid">
          <BaseInput
            v-model="groep.naam"
            label="Groepsnaam"
            type="text"
            :disabled="true"
          />
          <BaseInput
            v-model="groep.groepsnummer"
            label="Groepsnummer"
            type="text"
            :disabled="true"
          />
          <BaseInput
            v-model="groep.website"
            label="Website"
            type="text"
            :disabled="true"
          />
          <BaseTextArea
            v-model="groep.vrijeInfo"
            label="Vrije info"
            type="text"
            :disabled="true"
          />
          <BaseInput
            v-model="groep.email"
            label="E-mail"
            type="email"
            :disabled="true"
          />
          <date-picker
            v-model="groep.opgericht"
            label="Oprichtingsdatum"
            :disabled="true"
          />
          <BaseInput
            v-model="groep.rekeningnummer"
            label="Rekeningnummer"
            type="text"
            :disabled="true"
          />
          <BaseCheckbox
            type="checkbox"
            v-model="facturatieLeidingCheck"
            label="Leiding verbeterd"
            multiple="false"
          ></BaseCheckbox>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import { reactive, toRefs } from "@vue/reactivity";
import { onUpdated } from "@vue/runtime-core";
import BaseInput from "@/components/input/BaseInput";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import DatePicker from "@/components/input/DatePicker";
import BaseTextArea from "@/components/input/BaseTextArea";

export default {
  name: "Algemeen",
  components: {
    BaseTextArea,
    BaseInput,
    BaseCheckbox,
    DatePicker,
  },
  props: {
    modelValue: {
      type: Object,
    },
  },

  computed: {
    facturatieLeidingCheck() {
      return this.groep;
    },
  },

  setup(props) {
    const state = reactive({
      groep: {
        naam: "",
        groepsnummer: "",
        rekeningnummer: "",
        vrijeInfo: "",
        opgericht: "",
        facturatieLeidingCheck: false,
        facturatieLedenCheck: false,
        adressen: [],
        email: "",
        website: "",
        contacten: [],
        groepseigenGegevens: [],
        groepseigenFuncties: [],
      },
    });

    onUpdated(() => {
      state.groep = props.modelValue;
    });

    return { ...toRefs(state) };
  },
};
</script>

<style scoped></style>

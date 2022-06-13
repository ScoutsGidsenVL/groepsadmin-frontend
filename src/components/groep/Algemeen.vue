<template>
  <div class="mb-4">
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
            :disabled="kanGroepWijzigen"
          />
          <BaseTextArea
            v-model="groep.vrijeInfo"
            label="Vrije info"
            type="text"
            :disabled="!kanGroepWijzigen"
          />
          <BaseInput
            v-model="groep.email"
            label="E-mail"
            type="email"
            :disabled="!kanGroepWijzigen"
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
            :disabled="!kanGroepWijzigen"
          />
          <BaseCheckbox
            type="checkbox"
            v-model="facturatieLeidingCheck"
            label="Leiding verbeterd"
            multiple="false"
            @check="check('leidingVerbeterd')"
            :disabled="!kanGroepWijzigen"
          ></BaseCheckbox>
          <BaseCheckbox
            v-if="groep.ledenVerbeterdTonen"
            type="checkbox"
            v-model="facturatieLedenCheck"
            label="Leden verbeterd"
            multiple="false"
            @check="check('ledenverbeterd')"
            :disabled="!kanGroepWijzigen"
          ></BaseCheckbox>
          <BaseCheckbox
            type="checkbox"
            v-model="groep['publiek-inschrijven']"
            label="Publiek inschrijven"
            multiple="false"
            :disabled="!kanGroepWijzigen"
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
import rechtenService from "@/services/rechten/rechtenService";

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
      return !!this.groep.facturatieLeiding;
    },
    facturatieLedenCheck() {
      return !!this.groep.facturatieLeden;
    },
  },

  methods: {
    check(type) {
      switch (type) {
        case 'leidingVerbeterd':
          if (!this.groep.facturatieLeiding) {
            this.groep.facturatieLeiding = new Date().toISOString().slice(0, 10);
          } else {
            this.groep.facturatieLeiding = null;
          }
          break;
        case 'ledenverbeterd':
          if (!this.groep.facturatieLeden) {
            this.groep.facturatieLeden = new Date().toISOString().slice(0, 10);
          } else {
            this.groep.facturatieLeden = null;
          }
          break;
      }
    },
    kanGroepWijzigen() {
      return rechtenService.kanWijzigen(this.groep);
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

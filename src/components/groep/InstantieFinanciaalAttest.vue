<template>
  <div class="mb-4">
    <card>
      <template #title>
        <span class="font22">
          Instantie Financieel Attest
        </span>
      </template>
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
            :disabled="!kanGroepWijzigen"
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
            :disabled="!kanGroepWijzigen"
          />
          <BaseInput
            v-model="groep.rekeningnummer"
            label="Rekeningnummer"
            type="text"
            :disabled="!kanGroepWijzigen"
          />
          <Button icon="far fa-search-dollar" class="actie-button" title="Fiscaal attest 2024" label="Fiscaal attest 2024" @click="stopAlleFuncties"/>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import {reactive, toRefs} from "@vue/reactivity";
import {onUpdated} from "@vue/runtime-core";
import BaseInput from "@/components/input/BaseInput";
import DatePicker from "@/components/input/DatePicker";
import BaseTextArea from "@/components/input/BaseTextArea";
import rechtenService from "@/services/rechten/rechtenService";
import DateUtil from "@/services/dates/DateUtil";

export default {
  name: "Algemeen",
  components: {
    BaseTextArea,
    BaseInput,
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
    kanGroepWijzigen() {
      return rechtenService.kanWijzigen(this.groep);
    },
    formulierUrl() {
      return this.baseUrl + this.groep.groepsnummer;
    },
    leidingVerbeterd() {
      if (this.facturatieLeidingCheck) {
        return "Aangevinkt op " + DateUtil.formatteerDatum(this.groep.facturatieLeiding)
      }
      return "";
    },
    ledenVerbeterd() {
      if (this.facturatieLedenCheck) {
        return "Aangevinkt op " + DateUtil.formatteerDatum(this.groep.facturatieLeden)
      }
      return "";
    }
  },

  methods: {
    check(type) {
      switch (type) {
        case 'leidingVerbeterd':
          if (!this.groep.facturatieLeiding) {
            this.groep.facturatieLeiding = new Date().toISOString()
          } else {
            this.groep.facturatieLeiding = null;
          }
          break;
        case 'ledenverbeterd':
          if (!this.groep.facturatieLeden) {
            this.groep.facturatieLeden = new Date().toISOString();
          } else {
            this.groep.facturatieLeden = null;
          }
          break;
      }
    },
  },

  setup(props) {
    const state = reactive({
      baseUrl: window.location.origin.split('#' + window.location.pathname)[0] + '/groepsadmin/frontend/formulier/lidworden/',
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
      state.groep.opgericht = new Date(props.modelValue.opgericht);
    });

    return {...toRefs(state)};
  },
};
</script>

<style scoped></style>

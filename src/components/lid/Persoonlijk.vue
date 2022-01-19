<template>
  <div class="mb-4">
    <card>
      <template #title> Persoonlijk</template>
      <template #content>
        <div class="p-fluid">
          <BaseInput
            v-model="lid.vgagegevens.voornaam"
            label="Voornaam"
            type="text"
            :disabled="!nieuwLid"
            :invalid="v$.lid.vgagegevens.voornaam.$invalid"
            error-message="Voornaam is verplicht"
            @blur="v$.lid.vgagegevens.voornaam.$commit"
          />
          <BaseInput
            v-model="lid.vgagegevens.achternaam"
            label="Achternaam"
            type="text"
            :disabled="!nieuwLid"
            error-message="Achternaam is verplicht"
            :invalid="v$.lid.vgagegevens.voornaam.$invalid"
            @blur="v$.lid.vgagegevens.achternaam.$commit"
          />
          <date-picker
            v-model="lid.vgagegevens.geboortedatum"
            label="Geboortedatum"
            :disabled="!nieuwLid"
          />
          <BaseInput
            v-model="lid.gebruikersnaam"
            label="Gebruikersnaam"
            type="text"
            v-if="!nieuwLid"
          ></BaseInput>
          <BaseDropDown
            v-model="lid.persoonsgegevens.geslacht"
            :options="geslacht"
            label="Geslacht"
          />
          <BaseCheckbox
            type="checkbox"
            v-model="lid.vgagegevens.beperking"
            label="Persoon met beperking"
            multiple="false"
            help-link="https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:lid_toevoegen#persoonlijk"
          ></BaseCheckbox>
          <BaseCheckbox
            type="checkbox"
            v-model="lid.vgagegevens.verminderdlidgeld"
            label="Verminderd lidgeld"
            multiple="false"
            help-link="https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:lid_toevoegen#persoonlijk"
          ></BaseCheckbox>
          <BaseInput
            v-model="lid.email"
            label="Email"
            type="email"
            :invalid="v$.lid.email.$invalid"
            @blur="v$.lid.email.$commit"
            error-message="Geen geldig emailadres"
          ></BaseInput>
          <BaseInputTelefoon
            v-model="v$.lid.persoonsgegevens.gsm.$model"
            label="GSM"
            type="text"
            :invalid="v$.lid.persoonsgegevens.gsm.$invalid"
            @blur="v$.lid.persoonsgegevens.gsm.$commit"
            error-message="Geen geldig gsm nummer"
            @changeValue="formatNumber"
          ></BaseInputTelefoon>
          <BaseInput
            v-model="v$.lid.persoonsgegevens.rekeningnummer.$model"
            label="Rekeningnummer"
            type="text"
            :invalid="v$.lid.persoonsgegevens.rekeningnummer.$invalid"
            error-message="Geen geldig rekeningnummer"
            @blur="v$.lid.persoonsgegevens.rekeningnummer.$commit"
          ></BaseInput>
          <BaseCheckbox
            type="checkbox"
            v-model="lid.verbondsgegevens.lidgeldbetaald"
            label="Lidgeld betaald aan Scouts en Gidsen Vlaanderen"
            multiple="false"
          ></BaseCheckbox>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import DatePicker from "@/components/input/DatePicker";
import BaseDropDown from "@/components/input/BaseDropdown";
import BaseInput from "@/components/input/BaseInput";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import { reactive, toRefs, computed } from "@vue/reactivity";
import { onUpdated } from "@vue/runtime-core";
import { useVuelidate } from '@vuelidate/core'
import {email, required} from '@vuelidate/validators'
import BaseInputTelefoon from "@/components/input/BaseInputTelefoon";
import Telefoonnummer from "@/services/google/Telefoonnummer";

const ibantools = require('ibantools');
const isGeldigRekeningnummer = (value) => {
  let trimmedValue = value.replace(/\s+/g, '');
  return ibantools.isValidIBAN(trimmedValue);
}

const isGeldigGsmNummer = (value) => {
  value = Telefoonnummer.formatNumber(value);
  return Telefoonnummer.validateNumber(value);
}

export default {
  name: "Persoonlijk",
  components: { DatePicker, BaseInput, BaseCheckbox, BaseDropDown, BaseInputTelefoon },
  data() {
    return {
      geslacht: [
        { label: "Mannelijk", value: "man" },
        { label: "Vrouwelijk", value: "vrouw" },
        { label: "Andere", value: "andere" },
      ],
    };
  },
  methods: {
    formatNumber(value) {
      this.lid.persoonsgegevens.gsm = Telefoonnummer.formatNumber(value)
    }
  },
  props: {
    modelValue: {
      type: Object,
    },
    nieuwLid: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const state = reactive({
      lid: {
        email: "",
        gebruikersnaam: "",
        links: [],
        persoonsgegevens: {
          geslacht: "vrouw"
        },
        vgagegevens: {
          voornaam: '',
          achternaam: '',
        },
        verbondsgegevens: {},
      },
    });
    const rules = computed(() => ({
      lid: {
        email: {
          email
        },
        persoonsgegevens: {
          gsm: {
            isGeldigGsmNummer
          },
          rekeningnummer: {
            isGeldigRekeningnummer
          },
        },
        vgagegevens: {
          voornaam: {
            required
          },
          achternaam: {
            required
          }
        }
      },
    }))
    const v$ = useVuelidate(rules, state, { $rewardEarly: true });
    onUpdated(() => {
      state.lid = props.modelValue;
    });

    return { ...toRefs(state), v$ };
  },
};
</script>

<style scoped></style>

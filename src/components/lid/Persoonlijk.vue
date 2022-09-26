<template>
  <div class="mb-4">
    <card>
      <template #title> Persoonlijk</template>
      <template #content>
        <div class="p-fluid mt-2">
          <BaseInput
            v-model="lid.vgagegevens.voornaam"
            label="Voornaam"
            type="text"
            :disabled="!hasPermission"
            :invalid="v$.lid.vgagegevens.voornaam.$invalid"
            error-message="Voornaam is verplicht"
            @blur="v$.lid.vgagegevens.voornaam.$commit"
          />
          <BaseInput
            v-model="lid.vgagegevens.achternaam"
            label="Achternaam"
            type="text"
            :disabled="!hasPermission"
            error-message="Achternaam is verplicht"
            :invalid="v$.lid.vgagegevens.achternaam.$invalid"
            @blur="v$.lid.vgagegevens.achternaam.$commit"
          />
          <date-picker
            v-model="lid.vgagegevens.geboortedatum"
            label="Geboortedatum"
            :disabled="!hasPermission"
            error-message="Geboortedatum is verplicht"
            :invalid="v$.lid.vgagegevens.geboortedatum.$invalid"
            @blur="v$.lid.vgagegevens.achternaam.$commit"
          />
          <BaseInput
            v-model="lid.gebruikersnaam"
            :disabled="true"
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
            v-if="!nieuwLid"
            type="checkbox"
            v-model="lid.vgagegevens.beperking"
            label="Persoon met beperking"
            multiple="false"
            help-link="https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:lid_toevoegen#persoonlijk"
          ></BaseCheckbox>
          <BaseCheckbox
            v-if="!nieuwLid"
            type="checkbox"
            v-model="lid.vgagegevens.verminderdlidgeld"
            label="Verminderd lidgeld"
            multiple="false"
            :beschrijving="omschrijving"
            help-link="https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:lid_toevoegen#persoonlijk"
          ></BaseCheckbox>
          <BaseInput
            v-model="lid.email"
            :disabled="!eigenProfiel"
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
            v-if="!nieuwLid"
            type="checkbox"
            v-model="lid.verbondsgegevens.lidgeldbetaald"
            label="Lidgeld betaald aan Scouts en Gidsen Vlaanderen"
            multiple="false"
            :disabled="true"
          ></BaseCheckbox>
          <BaseCheckbox
            v-if="nieuwLid"
            type="checkbox"
            v-model="lid.vgagegevens.verminderdlidgeld"
            label="Verminderd lidgeld"
            multiple="false"
            :beschrijving="omschrijving"
          ></BaseCheckbox>
          <BaseTextArea
            v-if="nieuwLid"
            v-model="lid.opmerkingen"
            label="Opmerkingen"
            type="text"
          />
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
import {computed, reactive, toRefs} from "@vue/reactivity";
import {onUpdated} from "@vue/runtime-core";
import {useVuelidate} from '@vuelidate/core'
import {email, required} from '@vuelidate/validators'
import BaseInputTelefoon from "@/components/input/BaseInputTelefoon";
import Telefoonnummer from "@/services/google/Telefoonnummer";
import BaseTextArea from "@/components/input/BaseTextArea";
import rechtenService from "@/services/rechten/rechtenService";

const ibantools = require('ibantools');
const isGeldigRekeningnummer = (value) => {
  if (!value || value.isEmpty) {
    return true;
  }
  let trimmedValue = value.replace(/\s+/g, '');
  if (trimmedValue && trimmedValue.length === 0 || !value) {
    return true;
  }
  return ibantools.isValidIBAN(trimmedValue);
}

const isGeldigGsmNummer = (value) => {
  value = Telefoonnummer.formatNumber(value);
  return Telefoonnummer.validateNumber(value);
}

export default {
  name: "Persoonlijk",
  components: {DatePicker, BaseInput, BaseCheckbox, BaseDropDown, BaseInputTelefoon, BaseTextArea},
  data() {
    return {
      geslacht: [
        {label: "Mannelijk", value: "man"},
        {label: "Vrouwelijk", value: "vrouw"},
        {label: "Andere", value: "andere"},
      ],
      omschrijving: "We willen ieder kind de kans geven om lid te worden van scouting. " +
        "Geld mag daarbij geen rol spelen. Voor wie het financieel wat moeilijker is, bestaat het verminderd lidgeld. " +
        "Je betaalt dan 10 euro lidgeld (en mogelijk een extra bijdrage voor de groep zelf). " +
        "Je kan het vakje hierboven aanvinken of hierover iemand van de leiding aanspreken. " +
        "We verzekeren jullie dat dit alles in het volste vertrouwen zal gebeuren. Voor meer info " +
        "<a href='https://www.scoutsengidsenvlaanderen.be/scouting-op-maat' target='_blank'>klik hier</a>."
    };
  },
  methods: {
    formatNumber(value) {
      this.lid.persoonsgegevens.gsm = value;
    },
  },
  computed: {
    hasPermission() {
      if (this.lid.vgagegevens.voornaam) {
        return rechtenService.hasPermission(this.lid, 'vgagegevens');
      } else {
        return this.nieuwLid;
      }
    }
  },
  props: {
    modelValue: {
      type: Object,
    },
    eigenProfiel: {
      type: Boolean
    },
    nieuwLid: {
      type: Boolean,
      default: false
    }
  },
  // watch: {
  //   "lid.vgagegevens": {
  //     handler(oldValue, newValue) {
  //       console.log(oldValue);
  //       console.log(newValue);
  //       if (this.watchable) {
  //         this.gewijzigdLid.vgagegevens = this.lid.vgagegevens;
  //         this.changes = true;
  //       }
  //     },
  //     deep: true,
  //   },
  // },
  setup(props) {
    const state = reactive({
      lid: {
        email: "",
        gebruikersnaam: "",
        links: [],
        persoonsgegevens: {
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
          email,
          required
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
          },
          geboortedatum: {
            required
          }
        }
      },
    }))
    const v$ = useVuelidate(rules, state, {$rewardEarly: true});
    onUpdated(() => {
      state.lid = props.modelValue;
    });

    return {...toRefs(state), v$};
  },
};
</script>

<style scoped></style>

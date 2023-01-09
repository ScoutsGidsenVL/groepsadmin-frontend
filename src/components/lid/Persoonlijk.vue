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
            :disabled="!hasPermission('vgagegevens') && !nieuwLid"
            :invalid="v.lid.vgagegevens.voornaam.$dirty && v.lid.vgagegevens.voornaam.$invalid"
            :error-message="v.lid.vgagegevens.voornaam.required.$message"
          />
          <BaseInput
            v-model="lid.vgagegevens.achternaam"
            label="Achternaam"
            type="text"
            :disabled="!hasPermission('vgagegevens') && !nieuwLid"
            :invalid="v.lid.vgagegevens.achternaam.$dirty && v.lid.vgagegevens.achternaam.$invalid"
            :error-message="v.lid.vgagegevens.achternaam.required.$message"
          />
          <date-picker
            v-model="lid.vgagegevens.geboortedatum"
            label="Geboortedatum"
            :disabled="!hasPermission('vgagegevens')  && !nieuwLid"
            :error-message="v.lid.vgagegevens.geboortedatum.required.$message"
            :invalid="v.lid.vgagegevens.geboortedatum.$dirty && v.lid.vgagegevens.geboortedatum.$invalid"
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
            :disabled="!hasPermission('persoonsgegevens')  && !nieuwLid"
          />
          <BaseCheckbox
            :disabled="!hasPermission('vgagegevens')  && !nieuwLid"
            type="checkbox"
            v-model="lid.vgagegevens.beperking"
            label="Persoon met beperking"
            multiple="false"
            help-link="https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:lid_toevoegen#persoonlijk"
          ></BaseCheckbox>
          <BaseCheckbox
            v-if="!nieuwLid"
            :disabled="!hasPermission('vgagegevens')"
            type="checkbox"
            v-model="lid.vgagegevens.verminderdlidgeld"
            label="Verminderd lidgeld"
            multiple="false"
            :beschrijving="omschrijving"
            help-link="https://www.scoutsengidsenvlaanderen.be/leiding/ondersteuning/leiding/diversiteit/scouting-op-maat"
          ></BaseCheckbox>
          <BaseInput
            v-model="lid.email"
            :disabled="!eigenProfiel && !nieuwLid"
            label="Email"
            type="email"
            :invalid="v.lid.email.$dirty && v.lid.email.$invalid"
            :error-message="v.lid.email.email.$invalid ? v.lid.email.email.$message : v.lid.email.requiredIfNieuwLid.$message"
          ></BaseInput>
          <BaseInputTelefoon
            :disabled="!eigenProfiel && !nieuwLid"
            v-model="v.lid.persoonsgegevens.gsm.$model"
            label="GSM"
            type="text"
            :invalid="v.lid.persoonsgegevens.gsm.$dirty && v.lid.persoonsgegevens.gsm.$invalid"
            error-message="Geen geldig gsm nummer"
            @changeValue="formatNumber"
          ></BaseInputTelefoon>
          <BaseInput
            :disabled="!hasPermission('persoonsgegevens') && !nieuwLid"
            v-model="v.lid.persoonsgegevens.rekeningnummer.$model"
            label="Rekeningnummer"
            type="text"
            :invalid="v.lid.persoonsgegevens.rekeningnummer.$dirty && v.lid.persoonsgegevens.rekeningnummer.$invalid"
            error-message="Geen geldig rekeningnummer"
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
import {reactive, toRefs} from "@vue/reactivity";
import {useVuelidate} from '@vuelidate/core'
import {email, helpers, required, requiredIf} from '@vuelidate/validators'
import BaseInputTelefoon from "@/components/input/BaseInputTelefoon";
import Telefoonnummer from "@/services/google/Telefoonnummer";
import BaseTextArea from "@/components/input/BaseTextArea";
import rechtenService from "@/services/rechten/rechtenService";
import {onUpdated} from "@vue/runtime-core";
import DateUtil from "@/services/dates/DateUtil";

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
      omschrijvingNieuwLid: "We willen ieder kind de kans geven om lid te worden van scouting. " +
        "Geld mag daarbij geen rol spelen. Voor wie het financieel wat moeilijker is, bestaat het verminderd lidgeld. " +
        "Je betaalt dan 10 euro lidgeld (en mogelijk een extra bijdrage voor de groep zelf). " +
        "Je kan het vakje hierboven aanvinken of hierover iemand van de leiding aanspreken. " +
        "We verzekeren jullie dat dit alles in het volste vertrouwen zal gebeuren. Voor meer info " +
        "<a href='https://www.scoutsengidsenvlaanderen.be/scouting-op-maat' target='_blank'>klik hier</a>.",

      omschrijvingBestaandLid: "Leden zijn niet alleen maar lid van Scouts en Gidsen Vlaanderen vzw, maar gaan ook mee op weekend, kamp, ...<br> " +
        " Naast verminderd lidgeld, kan je daarom als groep ook beroep doen op 'Fonds op Maat': " +
        " hiermee kan je de deelnameprijs aan activiteiten voor leden en hun gezin verlagen.<br> " +
        " Als je <a href=\"https://www.scoutsengidsenvlaanderen.be/aanvraagformulier-voor-fonds-op-maat\" target=\"_blank\">dit formulier</a> " +
        " invult (let op: je moet ingelogd zijn op de website), " +
        " komt Scouts en Gidsen Vlaanderen vzw voor 1/3 tussen in de deelnameprijs.<br> " +
        " Het formulier vul je als (groeps)leiding in, de ouders hoeven niets te doen."
    };
  },
  methods: {
    formatNumber(value) {
      this.lid.persoonsgegevens.gsm = value;
    },
    hasPermission(type) {
      if (this.nieuwLid) {
        return true
      }
      if (this.lid.vgagegevens.voornaam || this.lid.vgagegevens.achternaam) {
        return rechtenService.canBeShowed(this.lid, type);
      } else {
        return this.nieuwLid;
      }
    },
  },
  computed: {
    omschrijving() {
      return this.inschrijving ? this.omschrijvingNieuwLid : this.omschrijvingBestaandLid;
    },
    formattedDate() {
      return DateUtil.formatGeboortedatum(this.lid.vgagegevens.geboortedatum);
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
    },
    inschrijving: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const state = reactive({
      lid: props.modelValue
    });

    const rules = {
      lid: {
        email: {
          email: helpers.withMessage('Geen geldig emailadres', email),
          requiredIfNieuwLid: helpers.withMessage("Email is verplicht", requiredIf(props.inschrijving || props.nieuwLid))
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
            required: helpers.withMessage('Voornaam is verplicht', required)
          },
          achternaam: {
            required: helpers.withMessage('Achternaam is verplicht', required)
          },
          geboortedatum: {
            required: helpers.withMessage('Geboortedatum is verplicht', required)
          }
        }
      },
    }

    onUpdated(() => {
      state.lid = props.modelValue;
    })


    const v = useVuelidate(rules, state);
    return {...toRefs(state), v};
  },
};
</script>

<style scoped></style>

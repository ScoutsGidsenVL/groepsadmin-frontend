<template>
  <div class="adressen-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span class="font22"> {{ title }}</span>
          <Button
            icon="pi pi-plus"
            class="p-button-rounded p-button-outlined mt-1 add-button"
            @click="voegAdresToe"
            title="Voeg adres toe"
            v-if="lidaanvraag || heeftToegang('nieuw lid')"
          />
        </div>
      </template>
      <template #content>
        <accordion :multiple="true">
          <accordionTab v-for="(adres, index) in adressen" :key="index">
            <template #header>
              <div class="d-flex col-12 justify-content-between">
                <span>{{ setHeader(adres) }}</span>
                <i
                  class="pi pi-envelope mr-3"
                  v-if="adressen[index].postadres"
                  title="postadres"
                ></i>
                <Button
                  v-if="!adressen[index].postadres && heeftToegang('adressen')"
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-outlined p-button-danger remove-button mr-1"
                  @click="
                    $event.stopPropagation();
                    remove(index);
                  "
                  title="Verwijder adres"
                />
              </div>
            </template>
            <base-dropdown
              :options="landen"
              label="Land"
              v-model="adressen[index].land"
              @changeValue="veranderLand(index)"
              :disabled="!heeftToegang('nieuw lid')"
            />
            <gemeente-zoek-auto-complete
              :index="index"
              label="Woonplaats"
              v-model="adressen[index]"
              v-if="adressen[index].land === 'BE'"
              :disabled="!heeftToegang('adressen')"
            />
            <straat-zoek-auto-complete
              :index="index"
              :disabled="(!adressen[index].postcode && !adressen[index].gemeente) || !heeftToegang('adressen')"
              label="Straat"
              v-model="adressen[index]"
              :value="adressen[index].straat"
              v-if="adressen[index].land === 'BE'"
            />
            <BaseInput
              v-if="adressen[index] && adressen[index].land !== 'BE'"
              :disabled="!heeftToegang('adressen')"
              label="Postcode"
              v-model="adressen[index].postcode"
              type="text"
              :invalid="v.adressen.$each.$response.$errors[index].postcode && v.adressen.$each.$response.$errors[index].postcode.length > 0"
              :error-message="(v.adressen.$each.$response.$errors[index].postcode &&
                              v.adressen.$each.$response.$errors[index].postcode.length > 0) ?
                              v.adressen.$each.$response.$errors[index].postcode[0].$message : ''"
            />
            <BaseInput
              v-if="adressen[index] && adressen[index].land !== 'BE'"
              label="Gemeente"
              v-model="adressen[index].gemeente"
              type="text"
              :disabled="!heeftToegang('adressen')"
              :invalid="v.adressen.$each.$response.$errors[index].gemeente && v.adressen.$each.$response.$errors[index].gemeente.length > 0"
              :error-message="(v.adressen.$each.$response.$errors[index].gemeente &&
                              v.adressen.$each.$response.$errors[index].gemeente.length > 0) ?
                              v.adressen.$each.$response.$errors[index].gemeente[0].$message : ''"
            />
            <BaseInput
              v-if="adressen[index] && adressen[index].land !== 'BE'"
              label="Straat"
              v-model="adressen[index].straat"
              :disabled="!heeftToegang('adressen')"
              type="text"
              :invalid="v.adressen.$each.$response.$errors[index].straat && v.adressen.$each.$response.$errors[index].straat.length > 0"
              :error-message="(v.adressen.$each.$response.$errors[index].straat &&
                              v.adressen.$each.$response.$errors[index].straat.length > 0) ?
                              v.adressen.$each.$response.$errors[index].straat[0].$message : ''"
            />
            <BaseInput
              label="Nummer"
              v-model="adressen[index].nummer"
              :disabled="!adressen[index].straat || !heeftToegang('adressen')"
              type="text"
              :invalid="v.$dirty && v.adressen.$each.$response.$errors[index].nummer && v.adressen.$each.$response.$errors[index].nummer.length > 0"
              :error-message="(v.$dirty && v.adressen.$each.$response.$errors[index].nummer &&
                              v.adressen.$each.$response.$errors[index].nummer.length > 0) ?
                              v.adressen.$each.$response.$errors[index].nummer[0].$message : ''"
              @keyup="capitalize(index)"
            />
            <BaseInput
              label="Bus"
              v-model="adressen[index].bus"
              :disabled="!adressen[index].straat || !heeftToegang('adressen')"
              type="text"
              @keyup="capitalize(index)"
            />
            <BaseInputTelefoon
              v-model="adressen[index].telefoon"
              label="Telefoon"
              :disabled="!heeftToegang('adressen')"
              type="text"
              :invalid="v.$dirty && v.adressen.$each.$response.$errors[index].telefoon && v.adressen.$each.$response.$errors[index].telefoon.length > 0"
              :error-message="(v.$dirty && v.adressen.$each.$response.$errors[index].telefoon &&
                              v.adressen.$each.$response.$errors[index].telefoon.length > 0) ?
                              v.adressen.$each.$response.$errors[index].telefoon[0].$message : ''"
            ></BaseInputTelefoon>
            <BaseCheckbox
              v-if="!lidaanvraag"
              label="Postadres"
              multiple="false"
              v-model="adressen[index].postadres"
              @change="zetPostadres(index)"
              :disabled="adressen[index].postadres || !heeftToegang('adressen')"
            />
          </accordionTab>
        </accordion>
      </template>
    </card>
  </div>
</template>

<script>
import BaseDropdown from "@/components/input/BaseDropdown";
import GemeenteZoekAutoComplete from "@/components/adres/GemeenteZoekAutoComplete";
import StraatZoekAutoComplete from "@/components/adres/StraatZoekAutoComplete";
import BaseInput from "@/components/input/BaseInput";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import {toRefs} from "@vue/reactivity";
import AdresService from "@/services/adressen/AdresService";
import {useVuelidate} from "@vuelidate/core";
import {helpers, required} from "@vuelidate/validators";
import Telefoonnummer from "@/services/google/Telefoonnummer";
import BaseInputTelefoon from "@/components/input/BaseInputTelefoon";

export default {
  name: "Adressen",
  components: {
    BaseCheckbox,
    BaseInput,
    BaseDropdown,
    GemeenteZoekAutoComplete,
    StraatZoekAutoComplete,
    BaseInputTelefoon
  },
  props: {
    title: {
      type: String,
    },
    modelValue: {
      type: Object,
      default: null,
    },
    lidaanvraag: {
      type: Boolean,
      default: false,
    }
  },

  setup(props) {
    const {
      state,
      remove,
      voegAdresToe,
      setHeader,
      veranderLand,
      zetPostadres,
      heeftToegang
    } = AdresService.adresSpace(props);

    const isGeldigGsmNummer = (value) => {
      value = Telefoonnummer.formatNumber(value);
      return Telefoonnummer.validateNumber(value);
    }

    const rules = {
      "adressen": {
        $each: helpers.forEach({
          land: {
            required: helpers.withMessage('Land is verplicht', required)
          },
          postcode: {
            required: helpers.withMessage('Postcode is verplicht', required)
          },
          gemeente: {
            required: helpers.withMessage('Gemeente is verplicht', required)
          },
          straat: {
            required: helpers.withMessage('Straat is verplicht', required)
          },
          nummer: {
            required: helpers.withMessage('Nummer is verplicht', required)
          },
          telefoon: {
            isGeldigGsmNummer: helpers.withMessage('Geen geldig telefoonnummer', isGeldigGsmNummer)
          },
        })
      }
    }

    const capitalize = (index) => {
      if (state.adressen[index].bus) {
        state.adressen[index].bus = state.adressen[index].bus.toUpperCase();
      }
      if (state.adressen[index].nummer) {
        state.adressen[index].nummer = state.adressen[index].nummer.toUpperCase();
      }
    }

    const v = useVuelidate(rules, state);

    return {
      ...toRefs(state),
      voegAdresToe,
      remove,
      zetPostadres,
      veranderLand,
      setHeader,
      v,
      heeftToegang,
      capitalize
    };
  },
};
</script>

<style scoped></style>

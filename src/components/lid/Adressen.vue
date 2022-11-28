<template>
  <div class="adressen-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> {{ title }}</span>
          <Button
            icon="pi pi-plus"
            class="p-button-rounded p-button-outlined mt-1 add-button"
            @click="voegAdresToe"
            title="Voeg adres toe"
            v-if="!lidaanvraag"
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
                  v-if="!adressen[index].postadres"
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
            />
            <gemeente-zoek-auto-complete
              label="Woonplaats"
              v-model="adressen[index]"
              v-if="adressen[index].land === 'BE'"
            />
            <straat-zoek-auto-complete
              :disabled="!adressen[index].postcode && !adressen[index].gemeente"
              label="Straat"
              v-model="adressen[index]"
              :value="adressen[index].straat"
              v-if="adressen[index].land === 'BE'"
            />
            <BaseInput
              v-if="adressen[index] && adressen[index].land !== 'BE'"
              label="Postcode"
              v-model="adressen[index].postcode"
              type="text"
              :invalid="isPostcodeIngevuld(index)"
              error-message="Gelieve een postcode in te vullen"
            />
            <BaseInput
              v-if="adressen[index] && adressen[index].land !== 'BE'"
              label="Gemeente"
              v-model="adressen[index].gemeente"
              type="text"
              :invalid="isGemeenteIngevuld(index)"
              error-message="Gelieve een gemeente in te vullen"
            />
            <BaseInput
              v-if="adressen[index] && adressen[index].land !== 'BE'"
              label="Straat"
              v-model="adressen[index].straat"
              type="text"
              :invalid="isStraatIngevuld(index)"
              error-message="Gelieve een straat in te vullen"
            />
            <BaseInput
              label="Nummer"
              v-model="adressen[index].nummer"
              :disabled="!adressen[index].straat"
              type="text"
              :invalid="isNummerIngevuld(index)"
              error-message="Gelieve een nummer in te vullen"
            />
            <BaseInput
              label="Bus"
              v-model="adressen[index].bus"
              :disabled="!adressen[index].straat"
              type="text"
            />
            <BaseInput
              label="Telefoon"
              v-model="adressen[index].telefoon"
              type="text"
            />
            <BaseCheckbox
              v-if="!lidaanvraag"
              label="Postadres"
              multiple="false"
              v-model="adressen[index].postadres"
              @change="zetPostadres(index)"
              :disabled="adressen[index].postadres"
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
import {onUpdated} from "@vue/runtime-core";
import AdresService from "@/services/adressen/AdresService";

export default {
  name: "Adressen",
  components: {
    BaseCheckbox,
    BaseInput,
    BaseDropdown,
    GemeenteZoekAutoComplete,
    StraatZoekAutoComplete,
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
      isTelefoonnummerGeldig,
      isStraatIngevuld,
      isGemeenteIngevuld,
      isNummerIngevuld,
      voegAdresToe,
      setHeader,
      veranderLand,
      zetPostadres,
      isPostcodeIngevuld
    } = AdresService.adresSpace(props);

    onUpdated(() => {
      state.adressen = props.modelValue.adressen;
      if (state.adressen && state.adressen.length === 0) {
        voegAdresToe();
      }
    })

    return {
      ...toRefs(state),
      voegAdresToe,
      remove,
      isPostcodeIngevuld,
      isStraatIngevuld,
      isGemeenteIngevuld,
      isNummerIngevuld,
      zetPostadres,
      veranderLand,
      isTelefoonnummerGeldig,
      setHeader};
  },
};
</script>

<style scoped></style>

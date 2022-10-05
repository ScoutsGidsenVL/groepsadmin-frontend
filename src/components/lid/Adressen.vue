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
        <accordion :multiple="true" :activeIndex="[0]">
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
import {reactive, toRefs} from "@vue/reactivity";
import {onUpdated} from "@vue/runtime-core";

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
  data() {
    return {
      invalid: false,
      landen: [
        {label: "België", value: "BE"},
        {label: "Duitsland", value: "DE"},
        {label: "Frankrijk", value: "FR"},
        {label: "Groot-Brittannië", value: "GB"},
        {label: "Luxemburg", value: "LU"},
        {label: "Nederland", value: "NL"},
        {label: "Canada", value: "CA"},
      ],
    };
  },
  methods: {
    remove(index) {
      this.$confirm.require({
        message: "Ben je zeker dat je dit adres wil verwijderen?",
        header: "Adres verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          this.adressen.splice(index, 1);
        },
        reject: () => {
          this.$confirm.close();
        },
      });
    },

    isStraatIngevuld(index) {
      if (!this.adressen[index].straat){
        this.invalid = true;
        return !this.adressen[index].straat;
      } else {
        this.invalid = false;
        return true;
      }
    },

    isNummerIngevuld(index) {
      return !this.adressen[index].nummer;
    },

    isGemeenteIngevuld(index) {
      this.invalid = true;
      return !this.adressen[index].gemeente;
    },

    isPostcodeIngevuld(index) {
      return !this.adressen[index].postcode;
    },

    zetPostadres(index) {
      for (const adres of this.adressen) {
        adres.postadres = false;
      }
      this.adressen[index].postadres = true;
    },
    veranderLand(index) {
      this.adressen[index].postcode = "";
      this.adressen[index].gemeente = "";
      this.adressen[index].straat = "";
      this.adressen[index].nummer = "";
      this.adressen[index].bus = "";
    },
    setHeader(adres) {
      return adres.gemeente
        ? adres.straat + " " + adres.nummer + ", " + adres.gemeente
        : "Nieuw adres";
    },
    voegAdresToe() {

      let nieuwAdres = {
        land: "BE",
        postadres: false,
        omschrijving: "",
        id: "tempadres" + Date.now(),
        bus: "",
        gemeente: "",
        postcode: "",
      };

      if (this.adressen) {
        let bestaandPostadres = false;
        for (const adres of this.adressen) {
          if (adres.postadres) {
            bestaandPostadres = true;
          }
        }

        if (!bestaandPostadres) {
          nieuwAdres.postadres = true;
        }
      } else {
        nieuwAdres.postadres = true;
        this.adressen = [];
      }
      this.adressen.push(nieuwAdres);
    },
  },
  mounted() {
    // Bij een nieuw lid gaan we onmiddellijk een adres toevoegen
    if (!this.adressen) {
      this.voegAdresToe();
    }
  },
  setup(props) {
    const state = reactive({
      adressen: null,
    });

    onUpdated(() => {
      state.adressen = props.modelValue.adressen;
    });
    return {...toRefs(state)};
  },
};
</script>

<style scoped></style>

<template>
  <confirmDialog />
  <div class="contacten-card mb-4">
    <toast position="bottom-right"/>
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> {{ title }}</span>
          <Button
            icon="pi pi-plus"
            class="p-button-rounded add-button mt-1"
            @click="voegContactToe"
            v-if="contacten.length < 4"
            title="Voeg adres toe"
          />
        </div>
        <div class="text-black ml-2 small-text font-light" v-if="contacten.length === 0">
          <p class="small">Nog geen contacten toegevoegd.</p>
        </div>
      </template>
      <template #content>
        <accordion :multiple="true">
          <accordionTab v-for="(contact, index) in contacten" :key="index">
            <template #header>
              <div class="d-flex col-12 justify-content-between">
                <span>{{ setHeader(contact) }}</span>
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-outlined p-button-danger mr-1"
                  @click="
                    $event.stopPropagation();
                    remove(index);
                  "
                  title="Verwijder contact"
                />
              </div>
            </template>
            <base-dropdown
              :options="rollen"
              label="Rol"
              v-model="contacten[index].rol"
            />
            <base-input
              label="Voornaam"
              v-model="contacten[index].voornaam"
              type="text"
            />
            <base-input
              label="Achternaam"
              v-model="contacten[index].achternaam"
              type="text"
            />
            <base-input
              label="E-mail"
              v-model="contacten[index].email"
              type="text"
            />
            <BaseInputTelefoon
              v-model="contacten[index].gsm"
              label="GSM"
              type="text"
              :invalid="contacten[index].$invalid"
              @blur="contacten[index].$commit"
              error-message="Geen geldig gsm nummer"
              @changeValue="formatNumber(index)"
            ></BaseInputTelefoon>
            <base-checkbox
              label="Zelfde adres als lid"
              v-model="zelfdeAdres"
              @changeValue="changeCheckBox(index)"
            />
            <div v-if="!zelfdeAdres">
              <base-dropdown
                :options="landen"
                label="Land"
                v-model="contacten[index].adres.land"
                @changeValue="veranderLand(index)"
              />
              <gemeente-zoek-auto-complete
                label="Woonplaats"
                v-model="contacten[index].adres"
                v-if="contacten[index].adres.land === 'BE'"
              />
              <straat-zoek-auto-complete
                :disabled="!contacten[index].adres.postcode && !contacten[index].adres.gemeente"
                label="Straat"
                v-model="contacten[index].adres"
                :value="contacten[index].adres.straat"
                v-if="contacten[index].adres.land === 'BE'"
              />
              <BaseInput
                v-if="contacten[index].adres && contacten[index].adres.land !== 'BE'"
                label="Postcode"
                v-model="contacten[index].adres.postcode"
                type="text"
                :invalid="isPostcodeIngevuld(index)"
                error-message="Gelieve een postcode in te vullen"
              />
              <BaseInput
                v-if="contacten[index].adres && contacten[index].adres.land !== 'BE'"
                label="Gemeente"
                v-model="contacten[index].adres.gemeente"
                type="text"
                :invalid="isGemeenteIngevuld(index)"
                error-message="Gelieve een gemeente in te vullen"
              />
              <BaseInput
                v-if="contacten[index].adres && contacten[index].adres.land !== 'BE'"
                label="Straat"
                v-model="contacten[index].adres.straat"
                type="text"
                :invalid="isStraatIngevuld(index)"
                error-message="Gelieve een straat in te vullen"
              />
              <BaseInput
                label="Nummer"
                v-model="contacten[index].adres.nummer"
                :disabled="!contacten[index].adres.straat"
                type="text"
                :invalid="isNummerIngevuld(index)"
                error-message="Gelieve een nummer in te vullen"
              />
              <BaseInput
                label="Bus"
                v-model="contacten[index].adres.bus"
                :disabled="!contacten[index].adres.straat"
                type="text"
              />
              <BaseInput
                label="Telefoon"
                v-model="contacten[index].adres.telefoon"
                type="text"
              />
            </div>
          </accordionTab>
        </accordion>
      </template>
    </card>
  </div>
</template>

<script>
import BaseInput from "@/components/input/BaseInput";
import BaseDropdown from "@/components/input/BaseDropdown";
import {onUpdated} from "@vue/runtime-core";
import {reactive, toRefs} from "@vue/reactivity";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import GemeenteZoekAutoComplete from "@/components/adres/GemeenteZoekAutoComplete";
import StraatZoekAutoComplete from "@/components/adres/StraatZoekAutoComplete";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import BaseInputTelefoon from "@/components/input/BaseInputTelefoon";
import Telefoonnummer from "@/services/google/Telefoonnummer";
import useVuelidate from "@vuelidate/core";

const isGeldigGsmNummer = (value) => {
  value = Telefoonnummer.formatNumber(value);
  return Telefoonnummer.validateNumber(value);
}

export default {
  name: "Contacten",
  components: {ConfirmDialog, BaseCheckbox, BaseInput, BaseDropdown, GemeenteZoekAutoComplete, StraatZoekAutoComplete, BaseInputTelefoon},
  data() {
    return {
      landen: [
        {label: "België", value: "BE"},
        {label: "Duitsland", value: "DE"},
        {label: "Frankrijk", value: "FR"},
        {label: "Groot-Brittannië", value: "GB"},
        {label: "Luxemburg", value: "LU"},
        {label: "Nederland", value: "NL"},
        {label: "Canada", value: "CA"},
      ],
      rollen: [
        {
          value: "moeder",
          label: "Moeder",
        },
        {
          value: "vader",
          label: "Vader",
        },
        {
          value: "voogd",
          label: "Voogd",
        },
        {
          value: "Opvoedingsverantwoordelijke",
          label: "Opvoedingsverantwoordelijke",
        },
      ],
      zelfdeAdres: false
    };
  },
  props: {
    title: {
      type: String,
    },
    modelValue: {
      type: Object,
    },
    nieuwLid: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatNumber(index, value) {
      this.contacten[index].gsm = Telefoonnummer.formatNumber(value)
    },

    setHeader(contact) {
      return contact.rol + " " + contact.voornaam + " " + contact.achternaam;
    },

    remove(index) {
      this.$confirm.require({
        message: "Ben je zeker dat je dit contact wil verwijderen?",
        header: "Contact verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          this.contacten.splice(index, 1);
        },
        reject: () => {
          this.$confirm.close();
        },
      });
    },

    changeCheckBox(index) {
      this.contacten[index].adres.postcode = this.adres.postcode;
      this.contacten[index].adres.gemeente = this.adres.gemeente;
      this.contacten[index].adres.straat = this.adres.straat;
      this.contacten[index].adres.nummer = this.adres.nummer;
      this.contacten[index].adres.bus = this.adres.bus;
      this.contacten[index].zelfdeAdres = this.zelfdeAdres;
    },

    isStraatIngevuld(index) {
      if (!this.contacten[index].adres.straat) {
        this.invalid = true;
        return !this.contacten[index].adres.straat;
      } else {
        this.invalid = false;
        return true;
      }
    },

    isNummerIngevuld(index) {
      return !this.contacten[index].adres.nummer;
    },

    isGemeenteIngevuld(index) {
      this.invalid = true;
      return !this.contacten[index].adres.gemeente;
    },

    isPostcodeIngevuld(index) {
      return !this.contacten[index].adres.postcode;
    },

    voegContactToe() {
      if (this.veldenNietGoedIngevuld()) {
        this.$toast.add({
          severity: "warn",
          summary: "Contact toevoegen",
          detail: "Er kunnen geen contacten toegevoegd worden als de andere velden niet correct zijn ingevuld.",
          life: 3000,
        });
        return;
      }


      let nieuwContact = {
        rol: "moeder",
        voornaam: "",
        achternaam: "",
        id: "" + Date.now(),
        adres: {
          land: "BE",
          gemeente: "",
          postcode: "",
          straat: "",
          nummer: "",
          bus: ""
        }
      };
      this.contacten.push(nieuwContact);
    },
    veranderLand(index) {
      this.contacten[index].adres.postcode = "";
      this.contacten[index].adres.gemeente = "";
      this.contacten[index].adres.straat = "";
      this.contacten[index].adres.nummer = "";
      this.contacten[index].adres.bus = "";
    },

    veldenNietGoedIngevuld() {
      this.$emit('checkValidVelden');
      return !this.adres.postcode || !this.adres.gemeente || !this.adres.straat || !this.adres.nummer
    }
  },


  setup(props) {
    const rules = {
      gsm: {
        isGeldigGsmNummer
      }
    };

    const state = reactive({
      contacten: [],
      adres: [],
      adresArray: [],
    });

    onUpdated(() => {
      state.adresArray = [];
      state.contacten = props.modelValue.contacten;
      state.adres = props.modelValue.adres;
    });

    const v$ = useVuelidate(rules, state, {$rewardEarly: true});
    return {...toRefs(state), v$};
  },
};
</script>

<style scoped></style>

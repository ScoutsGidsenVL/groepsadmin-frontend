<template>
  <confirmDialog/>
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
              :invalid="v.$dirty && v.contacten.$each.$response.$errors[index].email && v.contacten.$each.$response.$errors[index].email.length > 0"
              :error-message="(v.$dirty && v.contacten.$each.$response.$errors[index].email &&
                              v.contacten.$each.$response.$errors[index].email.length > 0) ?
                              v.contacten.$each.$response.$errors[index].email[0].$message : ''"
            />
            <BaseInputTelefoon
              v-model="contacten[index].gsm"
              label="GSM"
              type="text"
              :invalid="v.$dirty && v.contacten.$each.$response.$errors[index].gsm && v.contacten.$each.$response.$errors[index].gsm.length > 0"
              :error-message="(v.$dirty && v.contacten.$each.$response.$errors[index].gsm &&
                              v.contacten.$each.$response.$errors[index].gsm.length > 0) ?
                              v.contacten.$each.$response.$errors[index].gsm[0].$message : ''"
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
import {email, helpers} from "@vuelidate/validators";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";

const isGeldigGsmNummer = (value) => {
  value = Telefoonnummer.formatNumber(value);
  return Telefoonnummer.validateNumber(value);
}

export default {
  name: "Contacten",
  components: {
    ConfirmDialog,
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
    },
    nieuwLid: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const confirm = useConfirm();
    const toast = useToast();

    const state = reactive({
      contacten: [],
      adres: [],
      adresArray: [],
      landen: [
        {label: "België", value: "BE"},
        {label: "Duitsland", value: "DE"},
        {label: "Frankrijk", value: "FR"},
        {label: "Groot-Brittannië", value: "GB"},
        {label: "Luxemburg", value: "LU"},
        {label: "Nederland", value: "NL"},
        {label: "Canada", value: "CA"},
        {label: "Polen", value: "PL"}
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
    });


    const rules = {
      contacten: {
        $each: helpers.forEach({
          gsm: {
            isGeldigGsmNummer: helpers.withMessage('Geen geldig telefoonnummer', isGeldigGsmNummer)
          },
          email: {
            email: helpers.withMessage("Geen geldig emailadres", email)
          }
        })
      }
    };

    const veranderLand = (index) => {
      state.contacten[index].adres.postcode = "";
      state.contacten[index].adres.gemeente = "";
      state.contacten[index].adres.straat = "";
      state.contacten[index].adres.nummer = "";
      state.contacten[index].adres.bus = "";
    }

    const veldenNietGoedIngevuld = () => {
      console.log(state.adres)
      return !state.adres.postcode || !state.adres.gemeente || !state.adres.straat || !state.adres.nummer
    }

    const formatNumber = (index) => {
      state.contacten[index].gsm = Telefoonnummer.formatNumber(state.contacten[index].gsm);
    }

    const setHeader = (contact) => {
      return contact.rol + " " + contact.voornaam + " " + contact.achternaam;
    }

    const remove = (index) => {
      confirm.require({
        message: "Ben je zeker dat je dit contact wil verwijderen?",
        header: "Contact verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          state.contacten.splice(index, 1);
        },
        reject: () => {
          confirm.close();
        },
      });
    }

    const changeCheckBox = (index) => {
      state.contacten[index].adres.postcode = state.adres.postcode;
      state.contacten[index].adres.gemeente = state.adres.gemeente;
      state.contacten[index].adres.straat = state.adres.straat;
      state.contacten[index].adres.nummer = state.adres.nummer;
      state.contacten[index].adres.bus = state.adres.bus;
      state.contacten[index].zelfdeAdres = state.zelfdeAdres;
    }

    const isStraatIngevuld = (index) => {
      if (!state.contacten[index].adres.straat) {
        state.invalid = true;
        return !state.contacten[index].adres.straat;
      } else {
        state.invalid = false;
        return true;
      }
    }

    const isNummerIngevuld = (index) => {
      return !state.contacten[index].adres.nummer;
    }

    const isGemeenteIngevuld = (index) => {
      state.invalid = true;
      return !state.contacten[index].adres.gemeente;
    }

    const isPostcodeIngevuld = (index) => {
      return !state.contacten[index].adres.postcode;
    }

    const voegContactToe = () => {
      if (veldenNietGoedIngevuld()) {
        toast.add({
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
        email: "",
        gsm: "",
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
      state.contacten.push(nieuwContact);
    }

    onUpdated(() => {
      state.adresArray = [];
      state.contacten = props.modelValue.contacten;
      state.adres = props.modelValue.adres;
    });

    const v = useVuelidate(rules, state);
    return {
      ...toRefs(state),
      v,
      formatNumber,
      voegContactToe,
      isNummerIngevuld,
      isGemeenteIngevuld,
      isPostcodeIngevuld,
      isStraatIngevuld,
      isGeldigGsmNummer,
      veranderLand,
      changeCheckBox,
      remove,
      setHeader
    };
  }
}
;
</script>

<style scoped></style>

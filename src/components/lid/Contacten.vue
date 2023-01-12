<template>
  <div class="contacten-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span class="font22"> {{ title }}</span>
          <Button
            icon="pi pi-plus"
            class="p-button-rounded add-button mt-1"
            @click="voegContactToe"
            title="Voeg adres toe"
            v-if="heeftToegang('contacten') || lidaanvraag"
          />
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
                  class="p-button-rounded p-button-outlined p-button-danger remove-button mr-1"
                  @click="
                    $event.stopPropagation();
                    remove($event, index);
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
            ></BaseInputTelefoon>
            <base-dropdown
              :options="adresArray"
              label="Adres"
              v-model="contacten[index].adres"
            />
            <template v-for="(adres, index2) in adressen" :key="index2">
              <base-input
                label="Telefoon"
                v-model="adressen[index2].telefoon"
                type="text"
                :disabled="true"
                v-if="contacten[index] && adres.id === contacten[index].adres"
              />
            </template>
          </accordionTab>
        </accordion>
      </template>
    </card>
  </div>
</template>

<script>
import BaseInput from "@/components/input/BaseInput";
import BaseDropdown from "@/components/input/BaseDropdown";
import {reactive, toRefs} from "@vue/reactivity";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import {onMounted} from "vue";
import {onUpdated} from "@vue/runtime-core";
import BaseInputTelefoon from "@/components/input/BaseInputTelefoon";
import {useVuelidate} from "@vuelidate/core";
import {email, helpers} from "@vuelidate/validators";
import Telefoonnummer from "@/services/google/Telefoonnummer";
import rechtenService from "@/services/rechten/rechtenService";

export default {
  name: "Contacten",
  components: {BaseInput, BaseDropdown, BaseInputTelefoon},
  props: {
    title: {
      type: String,
    },
    modelValue: {
      type: Object,
    },
    lidaanvraag: {
      type: Boolean,
      default: false,
    }
  },
  setup(props) {
    const confirm = useConfirm();
    const toast = useToast();

    const state = reactive({
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
      contacten: [],
      adressen: null,
      adresArray: [],
    });

    const voegContactToe = () => {
      // Wanneer er geen adressen bestaan mag er geen contact toegevoegd kunnen worden
      if (state.adressen && state.adressen.length > 0) {
        let nieuwContact = {
          rol: "moeder",
          voornaam: "",
          achternaam: "",
          adres: state.adressen[0].id,
          id: "" + Date.now(),
        };
        state.contacten.push(nieuwContact);
      } else {
        toast.add({
          severity: "warn",
          summary: "Contacten toevoegen",
          detail: "Nieuwe contacten kunnen pas worden toegevoegd wanneer alle andere formuliervelden correct werden ingevuld.",
          life: 8000,
        });
      }
    }

    const heeftToegang = (sectie) => {
      if (!props.lidaanvraag) {
        return rechtenService.canBeShowed(props.modelValue, sectie);
      }
      return true;
    }

    const remove = (event, index) => {
      confirm.require({
        target: event.currentTarget,
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

    const setHeader = (contact) => {
      return contact.rol + " " + contact.voornaam + " " + contact.achternaam;
    }

    const resetData = () => {
      state.adresArray = [];
      state.contacten = props.modelValue.contacten;
      state.adressen = props.modelValue.adressen;
      if (!state.contacten) {
        state.contacten = [];
      }
      if (state.adressen && state.adressen.length > 0) {
        state.adressen.forEach((adres) => {
          state.adresArray.push({
            value: adres.id,
            label:
              adres.straat +
              " " +
              adres.nummer +
              ", " +
              adres.postcode +
              " " +
              adres.gemeente,
          });
        });
      }
    }

    const isGeldigGsmNummer = (value) => {
      value = Telefoonnummer.formatNumber(value);
      return Telefoonnummer.validateNumber(value);
    }

    const rules = {
      "contacten": {
        $each: helpers.forEach({
          gsm: {
            isGeldigGsmNummer: helpers.withMessage('Geen geldig telefoonnummer', isGeldigGsmNummer)
          },
          email: {
            email: helpers.withMessage("Geen geldig emailadres", email)
          }
        })
      }
    }

    const v = useVuelidate(rules, state);


    onMounted(() => {
      resetData();
    });

    onUpdated(() => {
      resetData();
    })

    return {
      ...toRefs(state),
      voegContactToe,
      heeftToegang,
      setHeader,
      remove,
      v
    };
  },
};
</script>

<style scoped></style>

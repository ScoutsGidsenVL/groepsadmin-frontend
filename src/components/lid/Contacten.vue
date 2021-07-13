<template>
  <div class="contacten-card ml-4 mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> {{ title }}</span>
          <Button
            icon="pi pi-plus"
            class="p-button-rounded add-button mt-1"
            @click="voegContactToe"
            title="Voeg adres toe"
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
            <base-input
              label="GSM"
              v-model="contacten[index].gsm"
              type="text"
            />
            <base-dropdown
              :options="adresArray"
              label="Adres"
              v-model="contacten[index].adres"
            />
            <template v-for="(adres, index) in adressen" :key="index">
              <base-input
                label="Telefoon"
                v-model="adressen[index].telefoon"
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
import { onUpdated } from "@vue/runtime-core";
import { reactive, toRefs } from "@vue/reactivity";

export default {
  name: "Contacten",
  components: { BaseInput, BaseDropdown },
  data() {
    return {
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
    };
  },
  props: {
    title: {
      type: String,
    },
    modelValue: {
      type: Object,
    },
  },
  methods: {
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

    voegContactToe() {
      let nieuwContact = {
        rol: "moeder",
        voornaam: "",
        achternaam: "",
        adres: this.adressen[0].id,
        id: "" + Date.now(),
      };

      this.contacten.push(nieuwContact);
    },
  },
  setup(props) {
    const state = reactive({
      contacten: null,
      adressen: null,
      adresArray: [],
    });

    onUpdated(() => {
      state.adresArray = [];
      state.contacten = props.modelValue.contacten;
      state.adressen = props.modelValue.adressen;
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
    });

    return { ...toRefs(state) };
  },
};
</script>

<style scoped></style>

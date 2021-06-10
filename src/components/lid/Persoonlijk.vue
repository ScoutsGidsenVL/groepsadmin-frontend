<template>
  <div class="ml-4 mb-4 ">
    <card>
      <template #title> Persoonlijk</template>
      <template #content>
        <div class="p-fluid">
          <BaseInput
            v-model="lid.vgagegevens.voornaam"
            label="Voornaam"
            type="text"
            :disabled=true
          />
          <BaseInput
            v-model="lid.vgagegevens.achternaam"
            label="Achternaam"
            type="text"
            :disabled=true
          />
          <date-picker
            v-model="lid.vgagegevens.geboortedatum"
            label="Geboortedatum"
            :disabled="true"
          />
          <BaseInput
            v-model="lid.gebruikersnaam"
            label="Gebruikersnaam"
            type="text"
            :disabled=true
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
            :disabled=false
          ></BaseInput>
          <BaseInput
            v-model="lid.persoonsgegevens.gsm"
            label="GSM"
            type="text"
            :disabled=false
          ></BaseInput>
          <BaseInput
            v-model="lid.persoonsgegevens.rekeningnummer"
            label="Rekeningnummer"
            type="text"
            :disabled=false
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
import {reactive, toRefs} from "@vue/reactivity";
import {onUpdated} from "@vue/runtime-core";

export default {
  name: "Persoonlijk",
  components: {DatePicker, BaseInput, BaseCheckbox, BaseDropDown},
  data() {
    return {
      geslacht: [
        {label: 'Mannelijk', value: 'man'},
        {label: 'Vrouwelijk', value: 'vrouw'},
        {label: 'Andere', value: 'andere'}
      ]
    }
  },
  props: {
    modelValue: {
      type: Object,
    }
  },
  setup(props) {
    const state = reactive({
      lid: {
        voornaam: '',
        achternaam: '',
        email: '',
        gebruikersnaam: '',
        links: [],
        persoonsgegevens: {},
        vgagegevens: {},
        verbondsgegevens: {}
      },
    })

    onUpdated(() => {
      state.lid = props.modelValue
    })

    return {...toRefs(state)};
  }
};
</script>

<style scoped></style>

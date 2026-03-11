<template>
  <div class="mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span class="font22">Erkenningsinstantie fiscale attesten</span>
        </div>
      </template>
      <template #content>
          <div class="p-fluid">
            <div>
              <p>
                Dit is de instantie/overheid die jou erkend en subsidieert als jeugdbeweging.
                Normaal gaat het om jouw lokale gemeentebestuur, bij twijfel kan je dit best
                navragen via jouw jeugdraad/jeugdconsulent/...
              </p>
            </div>
            <base-input
              v-model="instantie.naam"
              :disabled="!bewerkbaar"
              label="Naam instantie"
            ></base-input>
            <gemeente-zoek-auto-complete
              v-model="instantie.adres"
              :disabled="!bewerkbaar"
              label="Woonplaats"
            />
            <straat-zoek-auto-complete
              v-model="instantie.adres"
              :disabled="!bewerkbaar"
              label="Straat"
            />
            <BaseInput
              label="Nummer"
              v-model="instantie.adres.nummer"
              :disabled="!bewerkbaar"
              type="text"
              @keyup="capitalize()"
            />
            <BaseInput
              label="Bus"
              v-model="instantie.adres.bus"
              :disabled="!bewerkbaar"
              type="text"
              @keyup="capitalize()"
            />
            <base-input
              v-model="instantie.kbo"
              :disabled="!bewerkbaar"
              label="KBO (optioneel)"
            ></base-input>
          </div>
      </template>
    </card>
  </div>
</template>

<script>
import GemeenteZoekAutoComplete from "@/components/adres/GemeenteZoekAutoComplete";
import StraatZoekAutoComplete from "@/components/adres/StraatZoekAutoComplete";
import {reactive, toRefs} from "@vue/reactivity";
import {onUpdated} from "@vue/runtime-core";
import BaseInput from "@/components/input/BaseInput";

export default {
  name: "instantie",
  components: {
    BaseInput,
    GemeenteZoekAutoComplete,
    StraatZoekAutoComplete
  },
  props: {
    modelValue: {
      type: Object,
      default: null,
    },
    bewerkbaar: {
      type: Boolean,
      default: false
    }
  },
  mounted() {

  },
  setup(props) {

    const state = reactive({
      instantie: {
        naam: "",
        kbo: "",
        adres: {
          bus: "",
          gemeente: "",
          land: "BE",
          nummer: "",
          postcode: "",
          straat: ""
        }
      }
    });

    onUpdated(() => {
      if(props.modelValue)
        state.instantie = props.modelValue;
      else
        state.instantie = {
          naam: "",
          kbo: "",
          adres: {
            bus: "",
            gemeente: "",
            land: "BE",
            nummer: "",
            postcode: "",
            straat: ""
          }
        };
    });

    const capitalize = () => {
      if (state.instantie.adres.bus) {
        state.instantie.adres.bus = state.instantie.adres.bus.toUpperCase();
      }
      if (state.instantie.adres.nummer) {
        state.instantie.adres.nummer = state.instantie.adres.nummer.toUpperCase();
      }
    }

    return {
      ...toRefs(state),
      capitalize
    };
  }
};
</script>

<style scoped></style>

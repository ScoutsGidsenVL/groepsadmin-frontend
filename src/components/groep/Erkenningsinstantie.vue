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
              Dit is de instantie/overheid die jou erkend en subsidieert als
              jeugdbeweging. Normaal gaat het om jouw lokale gemeentebestuur,
              bij twijfel kan je dit best navragen via jouw
              jeugdraad/jeugdconsulent/...
            </p>
          </div>
          <base-input
            v-model="instantie.naam"
            :disabled="!bewerkbaar"
            label="Naam instantie"
          ></base-input>
          <AdresVelden
            v-model="instantie.adres"
            :disabled="!bewerkbaar"
            :showLand="false"
            :required="false"
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
import AdresVelden from "@/components/adres/AdresVelden";
import BaseInput from "@/components/input/BaseInput";
import { reactive, toRefs } from "@vue/reactivity";
import { onUpdated } from "@vue/runtime-core";

export default {
  name: "instantie",
  components: {
    AdresVelden,
    BaseInput,
  },
  props: {
    modelValue: {
      type: Object,
      default: null,
    },
    bewerkbaar: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {},
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
          straat: "",
        },
      },
    });

    onUpdated(() => {
      if (props.modelValue) state.instantie = props.modelValue;
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
            straat: "",
          },
        };
    });

    return {
      ...toRefs(state),
    };
  },
};
</script>

<style scoped></style>

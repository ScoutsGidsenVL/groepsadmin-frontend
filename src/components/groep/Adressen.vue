<template #content>
  <accordion :multiple="true" :activeIndex="[-1]">
    <accordionTab v-for="(adres, index) in adressen" :key="index">
      <template #header>
        <div class="d-flex col-12 justify-content-between">
          <span
            @click="
              $event.stopPropagation();
              showMarker(index);
            "
            ><i class="pi pi-map-marker"></i> {{ setMarker(index) }}
          </span>
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
      <base-input
        :model-value="adressen[index].omschrijving"
        :disabled="!bewerkbaar"
        label="Omschrijving"
      ></base-input>
      <gemeente-zoek-auto-complete
        label="Woonplaats"
        v-model="adressen[index]"
        v-if="adressen[index].land === 'BE'"
        :disabled="!bewerkbaar"
      />
      <straat-zoek-auto-complete
        :disabled="(!adressen[index].postcode && !adressen[index].gemeente) || !bewerkbaar"
        label="Straat"
        v-model="adressen[index]"
        :value="adressen[index].straat"
        v-if="adressen[index].land === 'BE'"
      />
      <BaseInput
        label="Telefoon"
        v-model="adressen[index].telefoon"
        type="text"
        :disabled="!bewerkbaar"
      />
      <BaseCheckbox
        label="Postadres"
        multiple="false"
        v-model="adressen[index].postadres"
        @change="zetPostadres(index)"
        :disabled="adressen[index].postadres || !bewerkbaar"
      />
    </accordionTab>
  </accordion>
</template>

<script>
import GemeenteZoekAutoComplete from "@/components/adres/GemeenteZoekAutoComplete";
import StraatZoekAutoComplete from "@/components/adres/StraatZoekAutoComplete";
import BaseInput from "@/components/input/BaseInput";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import { reactive, toRefs } from "@vue/reactivity";
import { onUpdated } from "@vue/runtime-core";

export default {
  name: "Adressen",
  components: {
    BaseCheckbox,
    BaseInput,
    GemeenteZoekAutoComplete,
    StraatZoekAutoComplete,
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
  data() {
    return {};
  },
  methods: {
    remove(index) {
      this.$confirm.require({
        message: "Ben je zeker dat je dit adres wil verwijderen?",
        header: "Adres verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          this.adressen.splice(1, index);
        },
        reject: () => {
          this.$confirm.close();
        },
      });
    },

    showMarker(index) {
      this.$emit("showMarker", index);
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
    setMarker(index) {
      const markerLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      return markerLabels[index];
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

      let bestaandPostadres = false;
      for (const adres of this.adressen) {
        if (adres.postadres) {
          bestaandPostadres = true;
        }
      }

      if (!bestaandPostadres) {
        nieuwAdres.postadres = true;
      }
      this.adressen.push(nieuwAdres);
    },
  },
  setup(props) {
    const state = reactive({
      adressen: null,
    });

    onUpdated(() => {
      state.adressen = props.modelValue.adressen;
    });

    return { ...toRefs(state) };
  },
};
</script>

<style scoped></style>

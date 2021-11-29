<template>
  <div class="row">
    <label class="col-12 col-sm-5 p-mb-2 p-mb-md-0 mt-3"> {{ label }} </label>
    <div class="col-12 col-sm-7 p-md-8">
      <AutoComplete
        class="adres-autocomplete d-flex custom-input-styling"
        v-model="zoekTerm"
        field="gemeente"
        forceSelection
        minLength="2"
        :suggestions="gefilterdeGemeentes"
        @complete="zoekGemeente"
        @itemSelect="kiesGemeente"
        placeholder="Vul postcode in en selecteer uw gemeente..."
        inputClass="adres-autocomplete-input"
        panelClass="adres-autocomplete-panel"
        :disabled="disabled"
      >
        <template #item="slotProps">
          <div class="ml-2">
            {{ slotProps.item }}
          </div>
        </template>
      </AutoComplete>
    </div>
  </div>
</template>

<script>
import AutoComplete from "primevue/autocomplete";
import RestService from "@/services/api/RestService";

export default {
  components: {
    AutoComplete,
  },
  name: "LidZoekAutoComplete",
  data() {
    return {
      gefilterdeGemeentes: null,
      zoekTerm: null,
    };
  },
  props: {
    label: {
      type: String,
    },
    modelValue: {
      type: Object,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.zoekTerm =
      this.adres.postcode && this.adres.gemeente
        ? this.adres.postcode + " " + this.adres.gemeente
        : null;
  },
  methods: {
    zoekGemeente() {
      RestService.zoekGemeente(this.zoekTerm).then((response) => {
        this.gefilterdeGemeentes = response.data;
      });
    },
    kiesGemeente(event) {
      this.adres.postcode = event.value.substring(0, 4);
      this.adres.gemeente = event.value.substring(5);
      this.adres.straat = "";
      this.adres.bus = "";
      this.adres.nummer = "";
      this.emitter.emit("clearStraat", null);
    },
  },

  created() {
    this.$watch(
      () => this.modelValue,
      () => {
        this.zoekTerm =
          this.modelValue.postcode + " " + this.modelValue.gemeente;
      }
    );
  },

  computed: {
    adres() {
      return this.modelValue;
    },
  },
};
</script>

<style scoped></style>

<template>
  <div>
    <div class="row">
      <label class="col-12 col-sm-5 p-mb-2 p-mb-md-0 mt-3"> {{ label }} </label>
      <div class="col-12 col-sm-7 p-md-8">
        <AutoComplete
          class="adres-autocomplete d-flex custom-input-styling"
          v-model="zoekTerm"
          forceSelection
          minLength="2"
          :suggestions="gefilterdeGemeentes"
          @complete="zoekGemeente"
          @itemSelect="kiesGemeente"
          @clear="verwijderGemeente"
          @blur="$emit('blur')"
          placeholder="Vul postcode in en selecteer uw gemeente..."
          inputClass="adres-autocomplete-input"
          panelClass="adres-autocomplete-panel"
          :disabled="disabled"
          :class="invalid ? 'p-invalid' : ''"
        >
          <template #item="slotProps">
            <div class="ml-2">
              {{ slotProps.item }}
            </div>
          </template>
        </AutoComplete>
      </div>
    </div>
    <div class="row">
      <small
        class="p-invalid col-12 col-sm-8 p-error offset-sm-5"
        v-if="invalid"
      >
        {{ errorMessage }}
      </small>
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
  name: "GemeenteZoekAutoComplete",
  emits: ["blur"],
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
    invalid: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: "",
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
    },

    verwijderGemeente() {
      this.adres.gemeente = "";
      this.adres.postcode = "";
      this.zoekTerm = "";
    },
  },

  created() {
    this.$watch(
      () => this.modelValue,
      () => {
        if (this.modelValue.postcode && this.modelValue.gemeente) {
          this.zoekTerm =
            this.modelValue.postcode + " " + this.modelValue.gemeente;
        } else {
          this.zoekTerm = null;
        }
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

<template>
  <div>
    <div class="row">
      <label class="col-12 col-sm-5 p-mb-2 p-mb-md-0 mt-3"> {{ label }} </label>
      <div class="col-12 col-sm-7 p-md-8">
        <AutoComplete
          class="adres-autocomplete d-flex custom-input-styling"
          v-model="zoekTerm"
          field="gemeente"
          forceSelection
          minLength=2
          :suggestions="gefilterdeGemeentes"
          @complete="zoekGemeente"
          @itemSelect="kiesGemeente"
          @clear="verwijderGemeente"
          @blur="checkValue"
          placeholder="Vul postcode in en selecteer uw gemeente..."
          inputClass="adres-autocomplete-input"
          panelClass="adres-autocomplete-panel"
          :disabled="disabled"
          :class="(invalid || invalidData) ? 'p-invalid' : ''"
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
        v-if="invalid || invalidData"
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
  name: "LidZoekAutoComplete",
  data() {
    return {
      gefilterdeGemeentes: null,
      zoekTerm: null,
      invalid: false
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
    invalidForm: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: "Gelieve een gemeente in te vullen"
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
      this.invalid = false;
      this.$emit("clearInvalidForm")
    },

    checkValue() {
      this.invalid = !this.adres.postcode && !this.adres.gemeente;
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
        if (this.modelValue.postcode && this.modelValue.gemeente){
          this.zoekTerm = this.modelValue.postcode + " " + this.modelValue.gemeente;
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
    invalidData() {
      return this.invalidForm;
    }

  },
};
</script>

<style scoped></style>

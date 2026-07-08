<template>
  <div>
    <div class="p-grid row">
      <label class="col-12 col-sm-5 p-mb-2 p-mb-md-0 mt-3"> {{ label }} </label>
      <div class="col-12 col-sm-7 p-md-8">
        <AutoComplete
          class="adres-autocomplete d-flex custom-input-styling"
          v-model="zoekTerm"
          :disabled="disabled"
          minLength="2"
          :suggestions="gefilterdeStraten"
          @complete="zoekStraat"
          @itemSelect="kiesStraat"
          @clear="verwijderStraat"
          @blur="checkValue"
          placeholder="Straat..."
          inputClass="adres-autocomplete-input"
          panelClass="adres-autocomplete-panel"
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
  name: "StraatZoekAutoComplete",
  emits: ["blur"],
  data() {
    return {
      gefilterdeStraten: null,
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
    this.zoekTerm = this.modelValue.straat;
  },
  created() {
    this.$watch(
      () => this.modelValue,
      () => {
        this.zoekTerm = this.modelValue.straat;
      }
    );
  },
  methods: {
    zoekStraat() {
      RestService.zoekStraat(this.zoekTerm, this.modelValue.postcode).then(
        (response) => {
          this.gefilterdeStraten = response.data;
        }
      );
    },
    kiesStraat(event) {
      this.adres.straat = event.value;
    },
    verwijderStraat() {
      this.adres.straat = "";
      this.zoekTerm = "";
    },
    checkValue() {
      this.adres.straat = this.zoekTerm;
      this.$emit("blur");
    },
  },
  computed: {
    adres: {
      get() {
        return this.modelValue;
      },
    },
  },
};
</script>

<style scoped></style>

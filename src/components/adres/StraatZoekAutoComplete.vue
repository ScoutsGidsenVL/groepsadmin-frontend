<template>
  <div class="p-grid row">
    <label class="col-12 col-sm-5 p-mb-2 p-mb-md-0 mt-3"> {{ label }} </label>
    <div class="col-12 col-sm-7 p-md-8">
      <AutoComplete
        class="adres-autocomplete d-flex custom-input-styling"
        v-model="zoekTerm"
        :disabled="disabled"
        field="straat"
        forceSelection
        minLength="2"
        :suggestions="gefilterdeStraten"
        @complete="zoekStraat"
        @itemSelect="kiesStraat"
        @clear="verwijderStraat"
        placeholder="Straat..."
        inputClass="adres-autocomplete-input"
        panelClass="adres-autocomplete-panel"
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
  name: "StraatZoekAutoComplete",
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
  },
  mounted() {
    this.zoekTerm = this.modelValue.straat;
    this.emitter.on("clearStraat", (value) => {
      this.zoekTerm = value;
    });
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

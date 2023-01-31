<template>
  <div class="lid-search mb-1">
    <AutoComplete
      class="lid-autocomplete custom-input-styling"
      :class="sectie === 'ledenlijst' ? 'zoekbalk-styling-ledenlijst' : ''"
      v-model="zoekTerm"
      field="voornaam"
      forceSelection
      :suggestions="gefilterdeLeden"
      @complete="zoekLid"
      minLength=2
      @itemSelect="gaNaarLid"
      placeholder="Zoek op naam, gsm of e-mail"
      inputClass="lid-autocomplete-input"
      panelClass="lid-autocomplete-panel"
    >
      <template #item="slotProps">
        <div class="ml-2">
          {{ showLidGegevens(slotProps.item) }}
        </div>
      </template>
    </AutoComplete>
  </div>
</template>

<script>
import AutoComplete from "primevue/autocomplete";
import RestService from "@/services/api/RestService";
import DateUtil from "@/services/dates/DateUtil";

export default {
  props: {
    sectie: {
      type: String,
      default: ""
    }
  },
  components: {
    AutoComplete,
  },
  name: "LidZoekAutoComplete",
  data() {
    return {
      leden: null,
      gefilterdeLeden: null,
      zoekTerm: null,
    };
  },
  methods: {
    zoekLid() {
      RestService.zoeken(this.zoekTerm).then((response) => {
        this.gefilterdeLeden = response.data.leden;
      });
    },
    gaNaarLid(event) {
      this.zoekTerm = "";
      this.$router.push({ name: "Lid", params: { id: event.value.id } });
    },
    showLidGegevens(item) {
      return (
        item.voornaam +
        " " +
        item.achternaam +
        " " +
        DateUtil.formatGeboortedatum(item.geboortedatum)
      );
    },
  },
};
</script>

<style scoped></style>

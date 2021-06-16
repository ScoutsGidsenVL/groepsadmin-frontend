<template>
  <Dialog :header="bestaandSjabloon ? 'Sjabloon overschrijven' : 'Sjabloon opslaan'" v-model:visible="openModal" :style="{width: '50vw'}" :modal="true"
          :closable="false">
    <AutoComplete
      class="adres-autocomplete d-flex custom-input-styling"
      v-model="zoekTerm"
      field="label"
      minLength="2"
      :suggestions="mailSjablonen"
      @complete="zoekBestaandSjabloon"
      @itemSelect="kiesSjabloon"
      placeholder="Naam van sjabloon"
      inputClass="autocomplete-input"
      panelClass="autocomplete-panel"
      :disabled="disabled"
      :clear="clear"
      :class="error ? 'p-invalid' : ''"
    >
      <template #item="slotProps">
        <div class="ml-2">
          {{ slotProps.item.label }}
        </div>
      </template>
    </AutoComplete>

    <template #footer>
      <Button label="Annuleer" icon="pi pi-times" @click="closeModal" class="p-button-text cancel-button-dialog"/>
      <Button :label="bestaandSjabloon ? 'Overschrijven' : 'Opslaan'" icon="pi pi-save" @click="opslaan" autofocus class="save-button-dialog"/>
    </template>
  </Dialog>
</template>

<script>
import Dialog from "primevue/dialog";
import AutoComplete from "primevue/autocomplete";

export default {
  name: "SaveTemplateDialog",
  components: {
    Dialog,
    AutoComplete,
  },
  props: {
    open: {
      type: Boolean,
      default: true
    },
    sjablonen: {
      type: Array
    }
  },
  data() {
    return {
      zoekTerm: '',
      error: false,
      mailSjablonen: null,
      bestaandSjabloon: false,
      geselecteerdeSjabloon: null,
    }
  },

  methods: {
    closeModal() {
      this.$emit('closeModal');
    },
    zoekBestaandSjabloon() {
      this.mailSjablonen = [];
      this.sjablonen.forEach((sjabloon) => {
        if (sjabloon.label.indexOf(this.zoekTerm) > -1){
          this.mailSjablonen.push(sjabloon);
        }
      })
    },
    kiesSjabloon(event) {
      this.zoekTerm = event.value.label;
      this.selecteerSjabloon();
      this.checkBestaandSjabloon()
    },
    opslaan() {
      if (this.zoekTerm) {
        this.$emit('opslaan', this.zoekTerm, this.geselecteerdeSjabloon);
      } else {
        this.error = true
      }
    },

    checkBestaandSjabloon() {
      let bestaandeNaam = false
      this.sjablonen.forEach((sjabloon) => {
        if (sjabloon.label === this.zoekTerm){
          bestaandeNaam = true
        }
      })
      this.bestaandSjabloon = bestaandeNaam;
    },

    selecteerSjabloon() {
      this.sjablonen.forEach((sjabloon) => {
        if (sjabloon.label === this.zoekTerm){
          this.geselecteerdeSjabloon = sjabloon
        }
      })
    }
  },
  watch: {
    zoekTerm: {
      handler: function () {
        if (this.zoekTerm) {
          this.error = false;
        }
        this.checkBestaandSjabloon();
      },
    }
  },
  computed: {
    openModal() {
      return this.open;
    }
  },
}
</script>

<style scoped>

</style>
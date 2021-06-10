<template>
  <div class="content">
    <div class="row bovenbalk">
      <div class="col-12 col-lg-6 col-xl-4" v-if="!groepenLaden">
        <BaseDropdown :options="groepenArray" :model-value="selectedGroep" @changeValue="veranderGroep"/>
      </div>
      <div class="col-12 col-lg-6 col-xl-4 d-flex justify-content-start ml-4" v-if="groepenLaden">
        <span class="mt-1">Groepen laden &nbsp;<i class="fas fa-spinner fa-spin"></i></span>
      </div>
    </div>
    <form @submit.prevent="opslaan" autocomplete="off">
      <div class="row">
        <div class="col-12 col-lg-6 col-xl-4">
          <Algemeen v-model="selectedGroep"></Algemeen>
        </div>
        <div class="col-12 col-lg-6 col-xl-4">
          <Contacten title="Contact"  v-model="selectedGroep" :contactenLaden="contactenLaden"></Contacten>
        </div>
        <div class="col-12 col-lg-12 col-xl-4">
          <Lokalen :groep="selectedGroep" title="Lokalen"></Lokalen>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Algemeen from "@/components/groep/Algemeen";
import BaseDropdown from "@/components/input/BaseDropdown";
import specialeFuncties from "@/services/functies/specialeFuncties";
import RestService from "@/services/api/RestService";
import Contacten from "@/components/groep/Contacten";
import Lokalen from "@/components/groep/Lokalen";

export default {
  name: "Groep",
  components: {
    BaseDropdown,
    Algemeen,
    Contacten,
    Lokalen
  },

  data() {
    return {
      selectedGroep: {},
      groepenArray: [],
      contactenLaden: false,
    }
  },

  methods: {
    opslaan() {
      console.log('opslaan')
    },
    veranderGroep(groep) {
      this.selectedGroep = groep;
      this.getContacten();
    },
    getContacten() {
      this.contactenLaden = true;
      this.selectedGroep.groepsleiding = [];

      this.selectedGroep.contacten.forEach((contact) => {
        RestService.getLid(contact.oidLid)
          .then(res => {
            if (contact.oidFunctie === specialeFuncties.FV) {
              this.selectedGroep.fv = res.data;
            } else if (contact.oidFunctie === specialeFuncties.VGA) {
              this.selectedGroep.vga = res.data;
            } else {
              this.selectedGroep.groepsleiding.push(res.data);
            }
            this.contactenLaden = false;
          })
      })
    }
  },

  mounted() {
    this.selectedGroep = this.groepen[0];
    this.getContacten();
    this.groepen.forEach((groep) => {
      this.groepenArray.push({label: groep.naam + " - " + groep.id, value: groep})
    })
    this.selectedGroep.publiekInschrijven = this.selectedGroep['publiek-inschrijven'];
  },

  computed: {
    groepenLaden() {
      return this.$store.getters.groepenLaden
    },

    groepen() {
      return this.$store.getters.groepen
    }
  },
};
</script>

<style scoped></style>

<template>
  <div class="container-fluid md:w-90">
    <div class="hidden lg:block md:ml-8">
      <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 lg:ml-6"/>
    </div>
    <div class="lg:ml-8">
      <div class="lg:ml-6">
        <div class="row bovenbalk mt-7 mb-4">
          <div class="col-12 col-lg-6 col-xl-4 groep-select" v-if="!groepenLaden">
            <BaseDropdown
              :options="groepenArray"
              :model-value="selectedGroep"
              @changeValue="veranderGroep"
            />
          </div>
          <div
            class="col-12 col-lg-6 col-xl-4 d-flex justify-content-start"
            v-if="groepenLaden"
          >
        <span class="mt-1"
        >Groepen laden &nbsp;<i class="fas fa-spinner fa-spin"></i
        ></span>
          </div>
        </div>
        <form @submit.prevent="opslaan" autocomplete="off">
          <div class="row">
            <div class="col-12 col-lg-6 col-xl-4">
              <Algemeen v-model="selectedGroep"></Algemeen>
            </div>
            <div class="col-12 col-lg-6 col-xl-4">
              <Contacten
                v-model="selectedGroep"
                :contactenLaden="contactenLaden"
              ></Contacten>
            </div>
            <div class="col-12 col-lg-12 col-xl-4">
              <Lokalen :groep="selectedGroep"></Lokalen>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Algemeen from "@/components/groep/Algemeen";
import BaseDropdown from "@/components/input/BaseDropdown";
import specialeFuncties from "@/services/functies/specialeFuncties";
import Contacten from "@/components/groep/Contacten";
import Lokalen from "@/components/groep/Lokalen";

export default {
  name: "Groep",
  components: {
    BaseDropdown,
    Algemeen,
    Contacten,
    Lokalen,
  },

  data() {
    return {
      selectedGroep: {},
      groepenArray: [],
      contactenLaden: false,
      home: {icon: 'pi pi-home', to: '/dashboard'},
      breadcrumbItems: [
        {
          label: 'groep'
        },
      ],
    };
  },

  methods: {
    opslaan() {
      console.log("opslaan");
    },
    veranderGroep(groep) {
      this.selectedGroep = groep;
      this.getContacten();
    },
    getContacten() {
      this.contactenLaden = true;
      this.selectedGroep.groepsleiding = [];

      this.selectedGroep.contacten.forEach((contact) => {
        if (contact.oidFunctie === specialeFuncties.FV) {
          this.selectedGroep.fv = contact;
        } else if (contact.oidFunctie === specialeFuncties.VGA) {
          this.selectedGroep.vga = contact;
        } else {
          this.selectedGroep.groepsleiding.push(contact);
        }
        this.contactenLaden = false;
      });
    },
  },

  mounted() {
    this.selectedGroep = this.groepen[0];
    this.getContacten();
    this.groepen.forEach((groep) => {
      this.groepenArray.push({
        label: groep.naam + " - " + groep.id,
        value: groep,
      });
    });
    this.selectedGroep.publiekInschrijven = this.selectedGroep[
      "publiek-inschrijven"
      ];
  },

  computed: {
    groepenLaden() {
      return this.$store.getters.groepenLaden;
    },

    groepen() {
      return this.$store.getters.groepen;
    },
  },
};
</script>

<style scoped></style>

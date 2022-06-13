<template>
  <div>
    <SideMenu/>
    <ConfirmDialog/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div class="container-fluid md:w-90">
      <div class="hidden lg:block md:ml-8">
        <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 lg:ml-6"/>
      </div>
      <Loader
        :showLoader="laden"
      ></Loader>
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
            <div class="col-1 absolute right-0 mr-6">
              <opslaan-met-tekst @opslaan="opslaan" v-if="kanGroepWijzigen"></opslaan-met-tekst>
            </div>
          </div>
          <form @submit.prevent="opslaan" autocomplete="off">
            <div class="row">
              <div class="col-12 col-lg-6 col-xl-4">
                <Algemeen v-model="selectedGroep"></Algemeen>
                <groepseigen-functies v-model="selectedGroep"></groepseigen-functies>
              </div>
              <div class="col-12 col-lg-6 col-xl-4">
                <Contacten
                  v-model="selectedGroep"
                  :contactenLaden="contactenLaden"
                ></Contacten>
              </div>
              <div class="col-12 col-lg-12 col-xl-4">
                <Lokalen :groep="selectedGroep"></Lokalen>
                <groepseigen-gegevens v-model="selectedGroep" @opslaan="laden = !laden"></groepseigen-gegevens>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Algemeen from "@/components/groep/Algemeen";
import BaseDropdown from "@/components/input/BaseDropdown";
import specialeFuncties from "@/services/functies/SpecialeFuncties";
import Contacten from "@/components/groep/Contacten";
import Lokalen from "@/components/groep/Lokalen";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import GroepseigenFuncties from "@/components/groep/GroepseigenFuncties";
import OpslaanMetTekst from "@/components/buttons/OpslaanMetTekst";
import ConfirmDialog from "primevue/confirmdialog";
import rechtenService from "@/services/rechten/rechtenService";
import GroepseigenGegevens from "@/components/groep/GroepseigenGegevens";
import RestService from "@/services/api/RestService";
import Loader from "@/components/global/Loader";
import store from "@/store";

export default {
  name: "Groep",
  components: {
    GroepseigenGegevens,
    GroepseigenFuncties,
    BaseDropdown,
    Algemeen,
    Contacten,
    Lokalen,
    ConfirmDialog,
    SideMenu,
    IngelogdLid,
    OpslaanMetTekst,
    Loader
  },

  data() {
    return {
      selectedGroep: {},
      groepenArray: [],
      contactenLaden: false,
      changes: false,
      laden: false,
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
    this.laden = true;
      for (let i = 0; i < this.selectedGroep.groepseigenGegevens.length; i++) {
        this.selectedGroep.groepseigenGegevens[i].sort = i;

        if (this.selectedGroep.groepseigenGegevens[i].type !== 'lijst') {
          delete this.selectedGroep.groepseigenGegevens[i].keuzes;
        } else {
          this.selectedGroep.groepseigenGegevens[i].keuzes.forEach((keuze, index) => {
            if (!keuze) {
              this.selectedGroep.groepseigenGegevens[i].keuzes.splice(index, 1);
            }
          })
        }
      }

      RestService.updateGroep(this.selectedGroep)
        .then(res => {
          if (res.status === 200) {
            this.laden = false
            store.dispatch("getGroepen");
            this.$toast.add({
              severity: "success",
              summary: "Wijzigingen",
              detail: "Wijzigingen opgeslagen.",
              life: 3000,
            });
          }
        }).catch((error) => {
        this.$toast.add({
          severity: "warn",
          summary: "Functie",
          detail: error.response.data.beschrijving,
          life: 8000,
        });
      })
    },

    kanGroepWijzigen() {
      return rechtenService.kanWijzigen(this.selectedGroep);
    },

    veranderGroep(groep) {
      this.selectedGroep = groep;
      this.getContacten();
    },
    getContacten() {
      this.contactenLaden = true;
      this.selectedGroep.groepsleiding = [];

      if (this.selectedGroep && this.selectedGroep.contacten) {
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
      } else {
        this.contactenLaden = false;
      }
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

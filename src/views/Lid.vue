<template>
  <div class="container-fluid md:w-90 lg:ml-4">
    <div class="hidden lg:block lg:ml-8">
      <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4"/>
    </div>
    <lid-boven-balk :lid="lid" :id="id" class="lg:ml-8 mt-8"></lid-boven-balk>
    <div class="lg:ml-2">
      <form @submit.prevent="opslaan" autocomplete="off">
        <div class="row lg:ml-8">
          <div class="col-12 col-lg-6 col-xl-4">
            <persoonlijk v-model="lid"></persoonlijk>
          </div>
          <div class="col-12 col-lg-6 col-xl-4">
            <adressen v-model="lid" :title="'Adressen'"></adressen>
            <contacten v-model="lid" :title="'Contacten'"></contacten>
            <groepseigen-gegevens
              v-model="lid.groepseigenVelden"
              :title="'Groepseigen gegevens'"
            ></groepseigen-gegevens>
          </div>
          <div class="col-12 col-lg-12 col-xl-4">
            <functies
              :title="'Functies'"
              v-model="gesorteerdeFuncties"
            ></functies>
          </div>
        </div>
        <Button
          icon="pi pi-save"
          class="p-button-rounded add-adres-button"
          type="submit"
        />
      </form>
    </div>
  </div>
  <Footer/>
</template>

<script>
import Persoonlijk from "@/components/lid/Persoonlijk";
import LidBovenBalk from "@/components/lid/LidBovenBalk";
import Adressen from "@/components/lid/Adressen";
import Contacten from "@/components/lid/Contacten";
import GroepseigenGegevens from "@/components/lid/GroepseigenGegevens";
import Functies from "@/components/lid/Functies";
import RestService from "@/services/api/RestService";
import specialeFuncties from "@/services/functies/specialeFuncties";
import Footer from "@/components/global/Footer";

export default {
  name: "Lid",
  components: {
    Footer,
    Functies,
    GroepseigenGegevens,
    Contacten,
    Persoonlijk,
    LidBovenBalk,
    Adressen,
  },
  data() {
    return {
      home: {icon: 'pi pi-home', to: '/dashboard'},
      breadcrumbItems: [
        {
          label: 'lid'
        },
        {
          label: 'profiel'
        },
      ],
      aangepasteVgagegevens: false,
      aangepastePersoonsgegevens: false,
      aangepasteAdressen: false,
      aangepasteContacten: false,
      aangepasteFuncties: false,
      aangepasteGroepseigenVelden: false,
      id: "",

      changed: true,
      lid: {
        voornaam: "",
        achternaam: "",
        email: "",
        gebruikersnaam: "",
        links: [],
        persoonsgegevens: {},
        vgagegevens: {},
        verbondsgegevens: {},
      },
      gesorteerdeFuncties: {},
    };
  },

  watch: {
    "lid.persoonsgegevens": {
      handler: function () {
      },
      deep: true,
    },
    "lid.vgagegevens": {
      handler: function () {
      },
      deep: true,
    },
    "lid.adressen": {
      handler: function () {
      },
      deep: true,
    },
    "lid.contacten": {
      handler: function () {
      },
      deep: true,
    },
    "lid.functies": {
      handler: function () {
      },
      deep: true,
    },
    "lid.email": function () {
    },
  },

  created() {
    this.$watch(
      () => this.$route.params,
      (toParams) => {
        if (toParams.id === "profiel") {
          this.getProfiel();
        } else {
          this.getLid(toParams.id);
        }
      }
    );
  },

  mounted() {
    this.id = this.$route.params.id ? this.$route.params.id : "profiel";
    if (this.id === "profiel" && this.$store.getters.profiel) {
      this.getProfiel();
    }

    if (!this.lid || this.id !== "profiel" || this.changed) {
      this.getLid(this.id);
    }
  },

  methods: {
    opslaan() {
      console.log(this.lid);
    },

    getProfiel() {
      this.lid = this.$store.getters.profiel;
      this.sorteerFuncties();
    },

    getLid(id) {
      RestService.getLid(id).then((res) => {
        this.lid = res.data;
        if (id === "profiel") {
          this.$store.commit("setProfiel", res.data);
        }
        this.sorteerFuncties();
      });
    },

    sorteerFuncties() {
      this.gesorteerdeFuncties = {};
      this.lid.functies.forEach((functie) => {
        if (!(functie.groep in this.gesorteerdeFuncties)) {
          this.gesorteerdeFuncties[functie.groep] = [];
        }

        const functieById = this.$store.getters.functieById(functie.functie);

        let functieObject = {
          id: functieById.id,
          naam: functieById.beschrijving,
          begin: functie.begin,
          einde: functie.einde,
          specialeFunctie:
            functie.functie === specialeFuncties.FV ||
            functie.functie === specialeFuncties.VGA,
          actief: !functie.einde,
        };
        this.gesorteerdeFuncties[functie.groep].push(functieObject);
      });
    },
  },

  computed: {
    volledigeNaam() {
      return (
        this.lid.vgagegevens.voornaam + " " + this.lid.vgagegevens.achternaam
      );
    },
  },
};
</script>

<style scoped></style>

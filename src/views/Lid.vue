<template>
  <Loader
    :showLoader="laden"
  ></Loader>
  <div class="container-fluid md:w-90 lg:ml-4 md:pl-8">
    <div class="hidden lg:block lg:ml-8">
      <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4"/>
    </div>
    <lid-boven-balk :lid="lid" :id="id" class="lg:ml-8 mt-8" @opslaan="opslaan" :eigenProfiel="eigenProfiel"></lid-boven-balk>
    <div class="lg:ml-2">
      <form @submit.prevent="opslaan" autocomplete="off">
        <div class="row lg:ml-8">
          <div class="col-12 col-lg-6 col-xl-4">
            <persoonlijk v-model="lid"></persoonlijk>
            <groepseigen-gegevens
              v-if="groepseigenVelden && Object.keys(groepseigenVelden).length > 0"
              v-model="groepseigenVelden"
              :title="'Groepseigen gegevens'"
            ></groepseigen-gegevens>
          </div>
          <div class="col-12 col-lg-6 col-xl-4">
            <adressen v-model="lid" :title="'Adressen'"></adressen>
            <contacten v-model="lid" :title="'Contacten'"></contacten>

          </div>
          <div class="col-12 col-lg-12 col-xl-4">
            <functies
              v-model="gesorteerdeFuncties"
              @updateLid="updateFuncties"
              :lid="lid"
            ></functies>
            <functies-toevoegen
              v-model="gesorteerdeFuncties"
              :lid="lid"
              v-if="magFunctiesToevoegen"
            ></functies-toevoegen>
          </div>
        </div>
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
import specialeFuncties from "@/services/functies/SpecialeFuncties";
import Footer from "@/components/global/Footer";
import Loader from "@/components/global/Loader";
import rechtenService from "@/services/rechten/rechtenService";
import FunctiesToevoegen from "@/components/lid/FunctiesToevoegen";
import useVuelidate from '@vuelidate/core'

export default {
  name: "Lid",
  setup: () => ({ v$: useVuelidate() }),
  components: {
    Footer,
    Functies,
    GroepseigenGegevens,
    Contacten,
    Persoonlijk,
    LidBovenBalk,
    Adressen,
    Loader,
    FunctiesToevoegen
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
      eigenProfiel: false,
      id: "",

      changed: true,
      loadingLid: true,
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
      groepseigenVelden: {}
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
        console.log('functies aangepast');
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
        } else if (toParams.id) {
          this.getLid(toParams.id);
        }
      }
    );
  },

  mounted() {
    this.id = this.$route.params.id ? this.$route.params.id : "profiel";
    if (this.id === "profiel" && this.$store.getters.profiel) {
      this.eigenProfiel = true;
      this.getProfiel();
    }

    if (this.id && (!this.lid || this.id !== "profiel" || this.changed)) {
      this.getLid(this.id);
    }
  },

  methods: {
    opslaan() {
      this.v$.$touch();
      console.log(this.v$)
      if (this.v$.$invalid) {
        console.log(this.v$)
        return
      }
    },

    updateFuncties({functie, groepsnummer}) {
      let groep = this.$store.getters.groepByNummer(groepsnummer);
      let lid = {
        functies: [
          {
            functie: functie.id,
            groep: groep.id,
            einde: new Date(),
            begin: functie.begin
          }
        ]
      };
      RestService.updateLid(this.lid.id, lid).then(res => {
        if (res.status === 200) {
          this.$toast.add({
            severity: "success",
            summary: "Wijzigingen",
            detail: "Functie is gestopt",
          });
          this.lid = res.data;
          this.sorteerFuncties();
        }
      });
    },

    getProfiel() {
      this.lid = this.$store.getters.profiel;
      this.sorteerFuncties();
      this.filterGroepsEigenVelden();
    },

    getLid(id) {
      this.loadingLid = true
      RestService.getLid(id).then((res) => {
        this.lid = res.data;
        if (id === "profiel") {
          this.eigenProfiel = true;
          this.$store.commit("setProfiel", res.data);
        }
        this.sorteerFuncties();
      });
    },

    filterGroepsEigenVelden() {
      this.groepseigenVelden =  Object.fromEntries(Object.entries( this.lid.groepseigenVelden).filter(([key]) => this.lid.groepseigenVelden[key].schema.length > 0));
    },

    sorteerFuncties() {
      this.$store.commit("setGroepenLaden", true);
      let ongesorteerdeFuncties = {};
      let functies = [];
      if (this.eigenProfiel) {
         functies = this.$store.getters.profiel.functies;
      } else {
        functies = this.lid.functies;
      }
      functies.forEach((functie) => {
        if (!(functie.groep in ongesorteerdeFuncties)) {
          ongesorteerdeFuncties[functie.groep] = [];
        }

        const functieById = this.$store.getters.functieById(functie.functie);
        if (functieById) {
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
          ongesorteerdeFuncties[functie.groep].push(functieObject);
          if (!ongesorteerdeFuncties[functie.groep].active) {
            ongesorteerdeFuncties[functie.groep].active = functieObject.actief;
          }
        }
      });

      let inactieveGroepen = Object.entries(ongesorteerdeFuncties).filter(([key]) => !ongesorteerdeFuncties[key].active);
      inactieveGroepen.forEach(groep => {
        this.$store.dispatch('addGroep', groep[0]);
      })

      this.gesorteerdeFuncties = Object.keys(ongesorteerdeFuncties).sort().reduce(
        (obj, key) => {
          obj[key] = ongesorteerdeFuncties[key];
          return obj;
        },
        {}
      )
      this.$store.commit("setGroepenLaden", false);
      this.loadingLid = false;
    },


  },

  computed: {
    volledigeNaam() {
      return (
        this.lid.vgagegevens.voornaam + " " + this.lid.vgagegevens.achternaam
      );
    },
    laden() {
      return this.loadingLid;
    },
    magFunctiesToevoegen() {
      return rechtenService.canBeShowed(this.lid, 'functies.')
    }
  },
};
</script>

<style scoped></style>

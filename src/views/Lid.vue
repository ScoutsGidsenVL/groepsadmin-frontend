<template>
  <div>
    <SideMenu/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <ConfirmDialog group="lid">
      <template #message="slotProps">
        <div class="flex">
          <i :class="slotProps.message.icon" style="font-size: 2rem"></i>
          <p class="pl-2" v-html="slotProps.message.message"></p>
        </div>
      </template>
    </ConfirmDialog>
    <div class="container-fluid md:w-90">
      <div class="hidden lg:block lg:ml-8">
        <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4"/>
      </div>
      <Loader
        :showLoader="laden"
      ></Loader>
      <lid-boven-balk :lid="lid" :id="id" class="lg:ml-8 mt-8 lg:mt-4" @opslaan="opslaan"
                      :eigenProfiel="isEigenProfiel" :changes="wijzigingen"
                      @stopAlleFuncties="stopAlleFuncties"></lid-boven-balk>
      <div class="lg:ml-2">
        <form @submit.prevent="opslaan" autocomplete="off">
          <div class="row lg:ml-8">
            <div class="col-12 col-lg-6 col-xl-4">
              <persoonlijk v-model="lid" :eigenProfiel="isEigenProfiel"></persoonlijk>
            </div>
            <div class="col-12 col-lg-6 col-xl-4">
              <adressen v-model="lid" :title="'Adressen'"></adressen>
              <contacten v-model="lid" :title="'Contacten'"></contacten>
              <groepseigen-gegevens
                v-if="groepseigenVelden && Object.keys(groepseigenVelden).length > 0"
                v-model="groepseigenVelden"
                :title="'Groepseigen gegevens'"
              ></groepseigen-gegevens>
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
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import ConfirmDialog from "primevue/confirmdialog";

export default {
  name: "Lid",
  setup: () => ({v$: useVuelidate()}),
  components: {
    Footer,
    Functies,
    GroepseigenGegevens,
    Contacten,
    Persoonlijk,
    LidBovenBalk,
    Adressen,
    Loader,
    FunctiesToevoegen,
    SideMenu,
    IngelogdLid,
    ConfirmDialog
  },
  data() {
    return {
      home: {icon: 'pi pi-home', to: '/dashboard'},
      breadcrumbItems: [
        {
          label: 'lid'
        },
        {
          label: this.eigenProfiel ? 'profiel' : 'details'
        },
      ],
      eigenProfiel: false,
      watchable: false,
      changes: false,
      id: "",

      changed: true,
      loadingLid: true,
      gewijzigdLid: {},
      lid: {
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
        if (this.watchable) {
          this.gewijzigdLid.persoonsgegevens = this.lid.persoonsgegevens;
          this.changes = true;
        }
      },
      deep: true,
    },
    "lid.vgagegevens": {
      handler: function () {
        if (this.watchable) {
          this.gewijzigdLid.vgagegevens = this.lid.vgagegevens;
          this.changes = true;
        }
      },
      deep: true,
    },
    "lid.adressen": {
      handler: function () {
        if (this.watchable) {
          this.gewijzigdLid.adressen = this.lid.adressen;
          this.changes = true;
        }
      },
      deep: true,
    },
    "lid.contacten": {
      handler: function () {
        if (this.watchable) {
          this.gewijzigdLid.contacten = this.lid.contacten;
          this.changes = true;
        }
      },
      deep: true,
    },
    "lid.functies": {
      handler: function () {
        if (this.watchable) {
          this.gewijzigdLid.functies = this.lid.functies;
          this.changes = true;
        }
      },
      deep: true,
    },
    "lid.email": function () {
      if (this.watchable) {
        this.gewijzigdLid.email = this.lid.email;
        this.changes = true;
      }
    },
  },

  created() {
    this.emitter.on('changeGeg', (event) => {
      this.changes = true;
      this.changeGeg(event.veld, event.waarde, event.groep);
    })
    this.emitter.on('veranderFunctie', () => {
      this.changes = true
    })
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
    this.emitter.on('veranderFunctie', () => {
      this.changes = true
    })
    this.id = this.$route.params.id ? this.$route.params.id : "profiel";
    if (this.id === "profiel" && this.$store.getters.profiel) {
      this.eigenProfiel = true;
      this.getProfiel();
    }

    if (this.id && (!this.lid || this.id !== "profiel" || this.changed)) {
      this.getLid(this.id);
    }

    setTimeout(() => {
      this.watchable = true
    }, 2000);
  },

  methods: {
    stopAlleFuncties() {
      this.$confirm.require({
        group: 'lid',
        message:
          this.lid.vgagegevens.voornaam + " " + this.lid.vgagegevens.achternaam + ", je staat op punt om al je functies bij Scouts en Gidsen Vlaanderen te schrappen. " +
          " <br/>" +
          "(De functie VGA en FV kan niet geschrapt worden. Neem hiervoor contact op met groepsadministratie@scoutsengidsenvlaanderen.be)" +
          " <br/>" +
          "Ben je zeker?",
        header: "Alle functies stoppen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          this.lid.functies.forEach(functie => {
            if (functie.temp !== "tijdelijk" && (functie.functie !== specialeFuncties.vga && functie.functie !== specialeFuncties.fv)) {
              let functieInstantie = {
                functie: functie.functie,
                groep: functie.groep,
                einde: new Date().toISOString().slice(0, 10),
                begin: functie.begin
              };
              if (!this.gewijzigdLid.functies) {
                this.gewijzigdLid.functies = [];
              }
              this.gewijzigdLid.functies.push(functieInstantie);
            }
          })
          this.opslaan();
        },
        reject: () => {
          this.$confirm.close();
        },
      });
    },

    opslaan() {
      this.loadingLid = true;
      this.v$.$touch();
      if (this.v$.$invalid) {
        this.changes = false;
        this.$toast.add({
          severity: "warn",
          summary: "Wijzigingen",
          detail: "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier.",
          life: 3000,
        });
        return;
      }
      RestService.updateLid(this.lid.id, this.gewijzigdLid)
        .then(res => {
          this.lid = res.data;
          if (res.status === 200)
            this.$toast.add({
              severity: "success",
              summary: "Wijzigingen",
              detail: "Wijzigingen lid opgeslagen",
              life: 3000,
            });
          this.changes = false;
          this.sorteerFuncties();
        }).catch(error => {
        console.log(error);
      }).finally(() => {
        this.changes = false;
        this.loadingLid = false;
      })
    },

    changeGeg(veld, waarde, groep) {
      if (this.gewijzigdLid && Object.keys(this.gewijzigdLid).length === 0) {
        this.gewijzigdLid.groepseigenVelden = this.lid.groepseigenVelden;
      }
      this.gewijzigdLid.groepseigenVelden[groep].waarden[veld] = waarde;
    },

    updateFuncties({functie, groepsnummer}) {
      let groep = this.$store.getters.groepByNummer(groepsnummer);
      let lid = {
        functies: [
          {
            functie: functie.id,
            groep: groep.id,
            einde: new Date().toISOString().slice(0, 10),
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
      this.loadingLid = false;
    },

    getLid(id) {
      this.loadingLid = true
      RestService.getLid(id).then((res) => {
        this.lid = res.data;
        this.$store.commit('setGeselecteerdeLeden', []);
        this.$store.getters.geselecteerdeLeden.push(this.lid);
        if (id === "profiel") {
          this.eigenProfiel = true;
          this.$store.commit("setProfiel", res.data);
          this.loadingLid = false;
        }
        this.sorteerFuncties();
      });
    },

    filterGroepsEigenVelden() {
      this.groepseigenVelden = Object.fromEntries(Object.entries(this.lid.groepseigenVelden).filter(([key]) => this.lid.groepseigenVelden[key].schema.length > 0));
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
    }
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
    },
    isEigenProfiel() {
      return this.$route.params.id === "profiel"
    },
    wijzigingen() {
      return this.changes
    }
  },

  beforeRouteLeave(to, from, next) {
    if (this.changes) {
      this.$confirm.require({
        message:
          "Je hebt niet opgeslagen wijzigingen. Ben je zeker dat je wil doorgaan?",
        header: "Wijzigingen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          next();
        },
        reject: () => {
          next(false);
        },
      });
    } else {
      next();
    }
  },
};
</script>

<style scoped></style>

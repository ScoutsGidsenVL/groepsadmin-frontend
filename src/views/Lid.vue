<template>
  <div>
    <SideMenu/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <ConfirmDialog>
      <template #message="slotProps">
        <div class="flex">
          <i :class="slotProps.message.icon" style="font-size: 2rem"></i>
          <p class="pl-2" v-html="slotProps.message.message"></p>
        </div>
      </template>
    </ConfirmDialog>
    <div class="container-fluid md:w-90">
      <div class="hidden lg:block lg:ml-8 w-50">
        <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4"/>
      </div>
      <Loader
        :showLoader="laden"
      ></Loader>
      <div class="d-flex justify-content-end lg:mt-4 md:mt-10">
        <lid-zoek-auto-complete></lid-zoek-auto-complete>
      </div>
      <lid-boven-balk :lid="lid" :id="id" class="lg:ml-8 lg:mt-4" @opslaan="opslaan"
                      :eigenProfiel="isEigenProfiel" :changes="changes"
                      @disableWatchable="resetWatchable"
                      @stopAlleFuncties="stopAlleFuncties"
                      v-if="lid"
      ></lid-boven-balk>
      <div class="lg:ml-2 lg:mt-8" >
        <form @submit.prevent="opslaan" autocomplete="off">
          <div class="row lg:ml-8">
            <div class="col-12 col-lg-6 col-xl-4">
              <persoonlijk v-model="lid" :eigenProfiel="isEigenProfiel" v-if="lid"></persoonlijk>
            </div>
            <div class="col-12 col-lg-6 col-xl-4">
              <adressen v-model="lid" :title="'Adressen'" v-if="lid"></adressen>
              <contacten v-model="lid" :title="'Contacten'" v-if="lid"></contacten>
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
                v-if="lid"
              ></functies>
              <functies-toevoegen
                v-model="gesorteerdeFuncties"
                :lid="lid"
                v-if="magFunctiesToevoegen && lid"
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
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import ConfirmDialog from "primevue/confirmdialog";
import LidZoekAutoComplete from "@/components/global/LidZoekAutoComplete";
import {toRefs} from "@vue/reactivity";
import LidService from "@/services/lid/LidService";
import {computed, onMounted, watch} from "vue";
import {onBeforeRouteLeave, useRoute} from 'vue-router';
import useEmitter from "@/services/utils/useEmitter";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import {useStore} from 'vuex'


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
    Loader,
    FunctiesToevoegen,
    SideMenu,
    IngelogdLid,
    ConfirmDialog,
    LidZoekAutoComplete
  },
  setup() {
    const route = useRoute();
    const emitter = useEmitter();
    const confirm = useConfirm();
    const toast = useToast();
    const store = useStore();

    const {
      state
    } = LidService.lidSpace();

    //const v$ = useVuelidate(state, {$rewardEarly: true});

    watch(
      () => state.lid,
      () => {
        if (state.watchable && state.lid) {
          state.gewijzigdLid = state.lid;
          state.changes = true;
        }
      },
      {deep: true}
    )

    emitter.on('changeGeg', (event) => {
      state.changes = true;
      changeGeg(event.veld, event.waarde, event.groep);
    })
    emitter.on('veranderFunctie', () => {
      state.changes = true
    })

    watch(
      () => route.params.id,
      async newId => {
        if (newId === "profiel") {
          await getProfiel()
        } else {
          await getLid(newId)
          state.changes = false;
        }
      }
    )

    onMounted(() => {
      emitter.on('veranderFunctie', () => {
        state.changes = true
      })
      state.id = route.params.id ? route.params.id : "profiel";
      if (state.id === "profiel" && store.getters.profiel) {
        state.eigenProfiel = true;
        getProfiel();
      }

      if (state.id && (!state.lid || state.id !== "profiel" || state.changed)) {
        getLid(state.id);
      }
      resetWatchable();
    })

    const resetWatchable = () => {
      ('reset watchable')
      state.changes = false;
      state.watchable = false;
      setTimeout(() => {
        state.watchable = true
      }, 2000);
    }

    const stopAlleFuncties = () => {
      confirm.require({
        group: 'lid',
        message:
          state.lid.vgagegevens.voornaam + " " + state.lid.vgagegevens.achternaam + ", je staat op punt om al je functies bij Scouts en Gidsen Vlaanderen te schrappen. " +
          " <br/>" +
          "(De functie VGA en FV kan niet geschrapt worden. Neem hiervoor contact op met groepsadministratie@scoutsengidsenvlaanderen.be)" +
          " <br/>" +
          "Ben je zeker?",
        header: "Alle functies stoppen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          state.lid.functies.forEach(functie => {
            if (functie.temp !== "tijdelijk" && (functie.functie !== specialeFuncties.vga && functie.functie !== specialeFuncties.fv)) {
              let functieInstantie = {
                functie: functie.functie,
                groep: functie.groep,
                einde: new Date().toISOString().slice(0, 10),
                begin: functie.begin
              };
              if (!state.gewijzigdLid.functies) {
                state.gewijzigdLid.functies = [];
              }
              state.gewijzigdLid.functies.push(functieInstantie);
            }
          })
          opslaan();
        },
        reject: () => {
          confirm.close();
        },
      });
    }

    const opslaan = () => {
      state.loadingLid = true;
      //v$.$touch();
      //if (v$.$invalid) {
      if (state.changes) {
        state.changes = false;
        toast.add({
          severity: "warn",
          summary: "Wijzigingen",
          detail: "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier.",
          life: 3000,
        });
        return;
      }
      RestService.updateLid(state.lid.id, state.gewijzigdLid)
        .then(res => {
          state.lid = res.data;
          if (res.status === 200)
            toast.add({
              severity: "success",
              summary: "Wijzigingen",
              detail: "Wijzigingen lid opgeslagen",
              life: 3000,
            });
          state.changes = false;
          state.sorteerFuncties();
        }).catch(error => {
        console.log(error);
      }).finally(() => {
        state.changes = false;
        state.loadingLid = false;
      })
    }

    const changeGeg = (veld, waarde, groep) => {
      if (state.gewijzigdLid) {
        state.gewijzigdLid.groepseigenVelden = state.lid.groepseigenVelden;
      }
      if (state.gewijzigdLid.groepseigenVelden[groep]) {
        state.gewijzigdLid.groepseigenVelden[groep].waarden[veld] = waarde;
      }
    }

    const updateFuncties = ({functie, groepsnummer}) => {
      let groep = store.getters.groepByNummer(groepsnummer);
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
      RestService.updateLid(state.lid.id, lid).then(res => {
        if (res.status === 200) {
          toast.add({
            severity: "success",
            summary: "Wijzigingen",
            detail: "Functie is gestopt",
          });
          state.lid = res.data;
          state.sorteerFuncties();
        }
      });
    }

    const getProfiel = () => {
      state.lid = store.getters.profiel;
      sorteerFuncties();
      filterGroepsEigenVelden();
      state.loadingLid = false;
    }

    const getLid = (id) => {
      state.loadingLid = true
      RestService.getLid(id).then((res) => {
        state.lid = res.data;
        store.commit('setGeselecteerdeLeden', []);
        store.getters.geselecteerdeLeden.push(state.lid);
        if (id === "profiel") {
          state.eigenProfiel = true;
          store.commit("setProfiel", res.data);
          state.loadingLid = false;
        }
        sorteerFuncties();
        filterGroepsEigenVelden();
      });
    }

    const sorteerFuncties = () => {
      store.commit("setGroepenLaden", true);
      let ongesorteerdeFuncties = {};
      let functies = [];
      if (state.eigenProfiel) {
        functies = store.getters.profiel.functies;
      } else {
        functies = state.lid.functies;
      }
      functies.forEach((functie) => {
        if (!(functie.groep in ongesorteerdeFuncties)) {
          ongesorteerdeFuncties[functie.groep] = [];
        }

        const functieById = store.getters.functieById(functie.functie);
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
        store.dispatch('addGroep', groep[0]);
      })

      state.gesorteerdeFuncties = Object.keys(ongesorteerdeFuncties).sort().reduce(
        (obj, key) => {
          obj[key] = ongesorteerdeFuncties[key];
          return obj;
        },
        {}
      )
      store.commit("setGroepenLaden", false);
      state.loadingLid = false;
    }

    const filterGroepsEigenVelden = () => {
      state.groepseigenVelden = Object.fromEntries(Object.entries(state.lid.groepseigenVelden).filter(([key]) => state.lid.groepseigenVelden[key].schema.length > 0));
    }

    onBeforeRouteLeave((to, from, next) => {
      if (state.changes) {
        confirm.require({
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
    })

    const volledigeNaam = computed({
      get() {
        return (
          state.lid.vgagegevens.voornaam + " " + state.lid.vgagegevens.achternaam
        );
      }
    })

    const laden = computed({
      get() {
        return state.loadingLid;
      }
    })

    const magFunctiesToevoegen = computed({
      get() {
        if (state.lid) {
          return rechtenService.canBeShowed(state.lid, 'functies.')
        } else {
          return false;
        }
      }
    })

    const isEigenProfiel = computed({
      get() {
        return route.params.id === "profiel" || store.getters.profiel.id === route.params.id
      }
    })

    const wijzigingen = computed({
      get() {
        return state.changes
      }
    })

    const teBekijkenLid = computed({
      get() {
        return state.lid
      }
    })

    return {
      ...toRefs(state),
      stopAlleFuncties,
      opslaan,
      changeGeg,
      updateFuncties,
      volledigeNaam,
      laden,
      magFunctiesToevoegen,
      isEigenProfiel,
      wijzigingen,
      teBekijkenLid,
      resetWatchable
    }
  },
}

</script>

<style scoped></style>

<template>
  <div>
    <SideMenu/>
    <toast position="bottom-right">
      <template #message="slotProps">
        <div class="flex flex-column">
          <div class="text-center">
            <i class="pi pi-exclamation-triangle" style="font-size: 3rem" v-if="slotProps.severity === 'success'"></i>
            <h4>{{ slotProps.message.summary }}</h4>
            <p v-html="slotProps.message.detail"></p>
          </div>
        </div>
      </template>
    </toast>
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
        :showLoader="loadingLid"
      ></Loader>
      <div class="d-flex justify-content-end lg:mt-4 md:mt-10">
        <lid-zoek-auto-complete></lid-zoek-auto-complete>
      </div>
      <lid-boven-balk :lid="lid" :id="id" class="lg:ml-8 lg:mt-4" @opslaan="opslaan"
                      :eigenProfiel="isEigenProfiel" :changes="changes"
                      @disableWatchable="resetWatchable"
                      @stopAlleFuncties="stopAlleFuncties"
                      v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"
      ></lid-boven-balk>
      <div class="lg:ml-2 mt-8 lg:mt-8">
        <form @submit.prevent="opslaan" autocomplete="off">
          <div class="row lg:ml-8">
            <div class="col-12 col-lg-6 col-xl-4">
              <persoonlijk v-model="lid" :eigenProfiel="isEigenProfiel" v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"></persoonlijk>
            </div>
            <div class="col-12 col-lg-6 col-xl-4">
              <adressen v-model="lid" :title="'Adressen'" v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"></adressen>
              <contacten v-model="lid" :title="'Contacten'" v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"></contacten>
              <groepseigen-gegevens
                v-if="groepseigenVelden && Object.keys(groepseigenVelden).length > 0"
                v-model="groepseigenVelden"
                :title="'Groepseigen gegevens'"
              ></groepseigen-gegevens>
            </div>
            <div class="col-12 col-lg-12 col-xl-4">
              <functies
                v-model="gesorteerdeFuncties"
                :lid="lid"
                v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"
              ></functies>
              <functies-toevoegen
                v-model="gesorteerdeFuncties"
                :lid="lid"
                v-if="magFunctiesToevoegen && (lid.vgagegevens.voornaam || lid.vgagegevens.achternaam)"
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
import {computed} from "vue";

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
    const {
      state,
      store,
      route,
      stopAlleFuncties,
      opslaan,
      resetWatchable,
      changeGeg,
      updateFuncties,

    } = LidService.lidSpace();

    const volledigeNaam = computed({
      get() {
        return (
          state.lid.vgagegevens.voornaam + " " + state.lid.vgagegevens.achternaam
        );
      }
    })

    const magFunctiesToevoegen = computed({
      get() {
        if (state.lid.vgagegevens.voornaam) {
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
      volledigeNaam,
      magFunctiesToevoegen,
      isEigenProfiel,
      wijzigingen,
      teBekijkenLid,
      resetWatchable,
      changeGeg,
      updateFuncties,
    }
  },
}

</script>

<style scoped></style>

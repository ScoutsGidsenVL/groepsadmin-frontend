<template>
  <div>
    <SideMenu/>
    <ConfirmDialog/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div class="container-fluid md:w-90">
      <div class="hidden lg:block md:ml-8 w-50">
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
              <opslaan-met-tekst @opslaan="opslaan" v-if="kanGroepWijzigen" :changes="changes"></opslaan-met-tekst>
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
                <Lokalen :groep="selectedGroep" :kan-groep-wijzigen="kanGroepWijzigen"></Lokalen>
                <groepseigen-gegevens v-model="selectedGroep"></groepseigen-gegevens>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <Footer/>
</template>

<script>
import Algemeen from "@/components/groep/Algemeen";
import BaseDropdown from "@/components/input/BaseDropdown";
import Contacten from "@/components/groep/Contacten";
import Lokalen from "@/components/groep/Lokalen";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import GroepseigenFuncties from "@/components/groep/GroepseigenFuncties";
import OpslaanMetTekst from "@/components/buttons/OpslaanMetTekst";
import ConfirmDialog from "primevue/confirmdialog";
import GroepseigenGegevens from "@/components/groep/GroepseigenGegevens";
import Loader from "@/components/global/Loader";
import Footer from "@/components/global/Footer";
import GroepService from "@/services/groep/GroepService";
import {toRefs} from "@vue/reactivity";

export default {
  name: "Groep",
  components: {
    Footer,
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

  setup() {
    const {
      state,
      opslaan,
      changeLadenStatus,
      veranderGroep,
      kanGroepWijzigen,
      groepenLaden
    } = GroepService.groepSpace();

    return {
      ...toRefs(state),
      opslaan,
      changeLadenStatus,
      veranderGroep,
      kanGroepWijzigen,
      groepenLaden
    }
  }

};
</script>

<style scoped></style>

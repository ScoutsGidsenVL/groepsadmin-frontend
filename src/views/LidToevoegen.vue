<template>
  <div>
    <SideMenu/>
    <confirmDialog/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <Loader
      :showLoader="loadingLid"
    ></Loader>
    <div class="container-fluid md:w-90 lg:ml-4 md:pl-8">
      <div class="hidden lg:block lg:ml-8">
        <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 w-25"/>
      </div>
      <lid-boven-balk :lid="lid" :id="id" class="lg:ml-8 md:mt-10" :eigenProfiel="false"
                      :nieuwLid="true" :changes="changes" @opslaan="opslaan"></lid-boven-balk>
      <div class="lg:ml-2">
        <form @submit.prevent="opslaan" autocomplete="off">
          <div class="row lg:ml-8">
            <div class="col-12 col-lg-6 col-xl-4">
              <persoonlijk v-model="lid" :nieuwLid="true"></persoonlijk>
              <groepseigen-gegevens
                v-if="groepseigenVelden && Object.keys(groepseigenVelden).length > 0"
                v-model="groepseigenVelden"
                :title="'Groepseigen gegevens'"
              ></groepseigen-gegevens>
            </div>
            <div class="col-12 col-lg-6 col-xl-4">
              <adressen  v-model="lid" :title="'Adressen'"></adressen>
              <contacten v-model="lid" :title="'Contacten'" :lidaanvraag="true"></contacten>

            </div>
            <div class="col-12 col-lg-12 col-xl-4">
              <functies-toevoegen
                v-model="lid"
                v-if="magFunctiesToevoegen"
                @voegFunctieToe="voegFunctieToe"
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
import Footer from "@/components/global/Footer";
import GroepseigenGegevens from "@/components/lid/GroepseigenGegevens";
import Contacten from "@/components/lid/Contacten";
import Persoonlijk from "@/components/lid/Persoonlijk";
import LidBovenBalk from "@/components/lid/LidBovenBalk";
import Adressen from "@/components/lid/Adressen";
import Loader from "@/components/global/Loader";
import FunctiesToevoegen from "@/components/lid/FunctiesToevoegen";
import ConfirmDialog from "primevue/confirmdialog";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import LidToevoegenService from "@/services/lid/LidToevoegenService";
import {toRefs} from "@vue/reactivity";

export default {
  name: "LidToevoegen",
  setup() {
    const {
      state,
      v,
      laden,
      magFunctiesToevoegen,
      opslaan,
      voegFunctieToe
    } = LidToevoegenService.lidToevoegenSpace();



    return {
      ...toRefs(state),
      magFunctiesToevoegen,
      opslaan,
      voegFunctieToe,
      laden,
      v
    }
  },
  components: {
    Footer,
    GroepseigenGegevens,
    Contacten,
    Persoonlijk,
    LidBovenBalk,
    Adressen,
    Loader,
    FunctiesToevoegen,
    ConfirmDialog,
    SideMenu,
    IngelogdLid
  },
};
</script>

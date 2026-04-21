<template>
  <div>
    <SideMenu />
    <confirmDialog />
    <toast position="bottom-right" />
    <ingelogd-lid></ingelogd-lid>
    <PageLayout :breadcrumb-items="breadcrumbItems" :home="home">
      <Loader :showLoader="loadingLid"></Loader>
      <div>
        <lid-boven-balk
          :lid="lid"
          :id="id"
          class="lg:ml-8 mt-lg-4em mt-9"
          :eigenProfiel="false"
          :nieuwLid="true"
          :changes="changes"
          @opslaan="opslaan"
        ></lid-boven-balk>
        <div class="lg:ml-2">
          <form @submit.prevent="opslaan" autocomplete="off">
            <div class="row lg:ml-8">
              <div class="col-12 col-lg-6 col-xl-4">
                <persoonlijk v-model="lid" :nieuwLid="true"></persoonlijk>
              </div>
              <div class="col-12 col-lg-6 col-xl-4">
                <adressen
                  v-model="lid"
                  :title="'Adressen'"
                  :lidaanvraag="true"
                ></adressen>
                <contacten
                  v-model="lid"
                  :title="'Contacten'"
                  :lidaanvraag="true"
                ></contacten>
                <groepseigen-gegevens
                  v-if="
                    groepseigenVelden &&
                    Object.keys(groepseigenVelden).length > 0
                  "
                  v-model="groepseigenVelden"
                  :title="'Groepseigen gegevens'"
                ></groepseigen-gegevens>
              </div>
              <div class="col-12 col-lg-12 col-xl-4">
                <functies-toevoegen
                  v-model="lid"
                  v-if="magFunctiesToevoegen"
                  :nieuwLid="true"
                  @voegFunctieToe="voegFunctieToe"
                ></functies-toevoegen>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  </div>
</template>

<script>
import PageLayout from "@/components/global/PageLayout";
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
import { toRefs } from "@vue/reactivity";

export default {
  name: "LidToevoegen",
  setup() {
    const {
      state,
      v,
      laden,
      magFunctiesToevoegen,
      opslaan,
      voegFunctieToe,
    } = LidToevoegenService.lidToevoegenSpace();

    return {
      ...toRefs(state),
      magFunctiesToevoegen,
      opslaan,
      voegFunctieToe,
      laden,
      v,
    };
  },
  components: {
    PageLayout,
    GroepseigenGegevens,
    Contacten,
    Persoonlijk,
    LidBovenBalk,
    Adressen,
    Loader,
    FunctiesToevoegen,
    ConfirmDialog,
    SideMenu,
    IngelogdLid,
  },
};
</script>

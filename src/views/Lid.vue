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
    <MessageDialog :dialog-visible="messageDialog" :message="messageDialogMessage" :header="messageDialogHeader"
                   @close="messageDialog = false"/>
    <div class="container-fluid md:w-90">
      <div class="hidden lg:block lg:ml-8 w-25">
        <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4"/>
      </div>
      <Loader
        :showLoader="loadingLid"
      ></Loader>
      <div>
        <lid-boven-balk
          class="lg:ml-8 mt-lg-4em mt-9"
          v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"
          v-model="lid"
          :eigenProfiel="isEigenProfiel"
          :changes="changes"
          @stopAlleFuncties="stopAlleFuncties"
          @lidkaartAfdrukken="lidkaartAfdrukken"
          @opslaan="opslaan"
        ></lid-boven-balk>
        <div class="lg:ml-2">
          <form @submit.prevent="opslaan" autocomplete="off">
            <div class="row lg:ml-8">
              <Message severity="warn" v-if="false && !loadingLid && !lid.isActiefVvksmLid">
                {{ lid.nietVerzekerdReden }}
              </Message>
              <div class="col-12 col-lg-6 col-xl-4">
                <persoonlijk v-model="lid" :eigenProfiel="isEigenProfiel"
                             v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"></persoonlijk>
              </div>
              <div class="col-12 col-lg-6 col-xl-4">
                <adressen v-model="lid" :title="'Adressen'"
                          v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"></adressen>
                <contacten v-model="lid" :title="'Contacten'"
                           v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"></contacten>
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
                  @updateFuncties="updateFuncties"
                  @stopAlleFuncties="stopAlleFuncties"
                ></functies>
                <functies-toevoegen
                  v-model="lid"
                  v-if="magFunctiesToevoegen && (lid.vgagegevens.voornaam || lid.vgagegevens.achternaam)"
                  @voegFunctieToe="voegFunctieToe"
                ></functies-toevoegen>
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
import Footer from "@/components/global/Footer";
import Loader from "@/components/global/Loader";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import ConfirmDialog from "primevue/confirmdialog";
import {toRefs} from "@vue/reactivity";
import LidService from "@/services/lid/LidService";
import Persoonlijk from "@/components/lid/Persoonlijk";
import Adressen from "@/components/lid/Adressen";
import Contacten from "@/components/lid/Contacten";
import Functies from "@/components/lid/Functies";
import FunctiesToevoegen from "@/components/lid/FunctiesToevoegen";
import GroepseigenGegevens from "@/components/lid/GroepseigenGegevens";
import LidBovenBalk from "@/components/lid/LidBovenBalk";
import MessageDialog from "@/components/dialog/MessageDialog.vue";
import Message from "primevue/message";

export default {
  name: "Lid",
  components: {
    MessageDialog,
    Footer,
    Loader,
    SideMenu,
    IngelogdLid,
    ConfirmDialog,
    Persoonlijk,
    Adressen,
    Contacten,
    Functies,
    FunctiesToevoegen,
    GroepseigenGegevens,
    LidBovenBalk,
    Message
  },
  setup() {
    const {
      state,
      stopAlleFuncties,
      opslaan,
      resetWatchable,
      changeGeg,
      updateFuncties,
      volledigeNaam,
      magFunctiesToevoegen,
      isEigenProfiel,
      wijzigingen,
      teBekijkenLid,
      lidkaartAfdrukken,
      voegFunctieToe
    } = LidService.lidSpace();


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
      lidkaartAfdrukken,
      voegFunctieToe
    }
  },
}

</script>

<style scoped></style>

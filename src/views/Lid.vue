<template>
  <div>
    <SideMenu />
    <toast position="bottom-right">
      <template #message="slotProps">
        <div class="flex flex-column">
          <div class="text-center">
            <i
              class="pi pi-exclamation-triangle"
              style="font-size: 3rem"
              v-if="slotProps.severity === 'success'"
            ></i>
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
    <MessageDialog
      :dialog-visible="messageDialog"
      :message="messageDialogMessage"
      :header="messageDialogHeader"
      @close="messageDialog = false"
    />
    <PageLayout :breadcrumb-items="breadcrumbItems" :home="home">
      <Loader :showLoader="loadingLid"></Loader>
      <div>
        <lid-boven-balk
          class="lg:ml-8 mt-lg-4em mt-9"
          v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"
          v-model="lid"
          :eigenProfiel="isEigenProfiel"
          :heeftFiscaalAttest="heeftFiscaalAttest"
          :changes="changes"
          @stopAlleFuncties="stopAlleFuncties"
          @lidkaartAfdrukken="lidkaartAfdrukken"
          @attestAfdrukken="attestAfdrukken"
          @opslaan="opslaan"
        ></lid-boven-balk>
        <div class="lg:ml-2">
          <form @submit.prevent="opslaan" autocomplete="off">
            <div class="row lg:ml-8">
              <div class="col-12" v-if="!loadingLid && !lid.isActiefVvksmLid">
                <Message severity="warn" class="niet-verzekerd-balk">
                  {{ lid.nietVerzekerdReden }}
                </Message>
              </div>
              <div class="col-12" v-if="!loadingLid && wordtBinnenkortOudLid">
                <Message severity="warn" class="wordt-oud-lid-balk">
                  <div class="flex flex-column w-full gap-2">
                    <div
                      class="flex align-items-center justify-content-between w-full flex-wrap gap-2"
                    >
                      <span>
                        Je bent 20 jaar of ouder. Bezorg een uittreksel uit je
                        strafregister ter controle.
                        <a
                          href="https://wiki.scoutsengidsenvlaanderen.be/strafregister"
                          target="_blank"
                          class="wiki-icoon ml-1"
                        >
                          <i
                            class="fa fa-question-circle"
                            title="meer info"
                          ></i>
                        </a>
                      </span>
                      <FileUpload
                        ref="fileUploadRef"
                        mode="basic"
                        name="uittrekselStrafregister"
                        :customUpload="true"
                        :auto="false"
                        chooseLabel="Uittreksel opladen"
                        uploadIcon="pi pi-upload"
                        @select="selecteerUittrekselStrafregister"
                        @uploader="uploadUittrekselStrafregister"
                      ></FileUpload>
                    </div>
                  </div>
                </Message>
              </div>
              <div class="col-12 col-lg-6 col-xl-4">
                <persoonlijk
                  v-model="lid"
                  :eigenProfiel="isEigenProfiel"
                  v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"
                ></persoonlijk>
              </div>
              <div class="col-12 col-lg-6 col-xl-4">
                <uittreksel-strafregister
                  :title="'Uittreksel strafregister'"
                  v-if="
                    moetUittrekselStrafregisterBezorgen &&
                    (lid.vgagegevens.voornaam || lid.vgagegevens.achternaam)
                  "
                ></uittreksel-strafregister>
                <adressen
                  v-model="lid"
                  :title="'Adressen'"
                  v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"
                ></adressen>
                <contacten
                  v-model="lid"
                  :title="'Contacten'"
                  :eigenProfiel="isEigenProfiel"
                  v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"
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
                <functies
                  v-model="gesorteerdeFuncties"
                  :lid="lid"
                  v-if="lid.vgagegevens.voornaam || lid.vgagegevens.achternaam"
                  @updateFuncties="updateFuncties"
                  @stopAlleFuncties="stopAlleFuncties"
                ></functies>
                <functies-toevoegen
                  v-model="lid"
                  v-if="
                    magFunctiesToevoegen &&
                    (lid.vgagegevens.voornaam || lid.vgagegevens.achternaam)
                  "
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
import Loader from "@/components/global/Loader";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import ConfirmDialog from "primevue/confirmdialog";
import { ref } from "vue";
import { toRefs } from "@vue/reactivity";
import LidService from "@/services/lid/LidService";
import UittrekselStrafregisterService from "@/services/uittrekselStrafregister/UittrekselStrafregisterService";
import Persoonlijk from "@/components/lid/Persoonlijk";
import UittrekselStrafregister from "@/components/lid/UittrekselStrafregister";
import Adressen from "@/components/lid/Adressen";
import Contacten from "@/components/lid/Contacten";
import Functies from "@/components/lid/Functies";
import FunctiesToevoegen from "@/components/lid/FunctiesToevoegen";
import GroepseigenGegevens from "@/components/lid/GroepseigenGegevens";
import LidBovenBalk from "@/components/lid/LidBovenBalk";
import MessageDialog from "@/components/dialog/MessageDialog.vue";
import Message from "primevue/message";
import FileUpload from "primevue/fileupload";
import { useToast } from "primevue/usetoast";

export default {
  name: "Lid",
  components: {
    MessageDialog,
    PageLayout,
    Loader,
    SideMenu,
    IngelogdLid,
    ConfirmDialog,
    Persoonlijk,
    UittrekselStrafregister,
    Adressen,
    Contacten,
    Functies,
    FunctiesToevoegen,
    GroepseigenGegevens,
    LidBovenBalk,
    Message,
    FileUpload,
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
      heeftFiscaalAttest,
      wijzigingen,
      teBekijkenLid,
      attestAfdrukken,
      lidkaartAfdrukken,
      voegFunctieToe,
      wordtBinnenkortOudLid,
      moetUittrekselStrafregisterBezorgen,
    } = LidService.lidSpace();

    const toast = useToast();

    const fileUploadRef = ref(null);

    // De FileUpload-knop vereist een @uploader-handler (customUpload), maar
    // we sturen het uittreksel al meteen door in selecteerUittrekselStrafregister
    // hieronder, dus hier is niets meer te doen
    const uploadUittrekselStrafregister = () => {};

    const uploadDocument = (url) => {
      UittrekselStrafregisterService.uploadUittreksel(state.lid.id, url)
        .then(() => {
          toast.add({
            severity: "success",
            summary: "Uittreksel strafregister",
            detail: "Uittreksel opgeladen.",
            life: 3000,
          });
        })
        .catch((error) => {
          toast.add({
            severity: "warn",
            summary:
              (error.response && error.response.data.titel) ||
              "Uittreksel strafregister",
            detail:
              error.response &&
              (error.response.data.beschrijving || error.response.data.titel),
            life: 8000,
          });
        });
    };

    const selecteerUittrekselStrafregister = async (event) => {
      const bestand = event.files[event.files.length - 1];
      // Meteen resetten zodat de knoptekst "Uittreksel opladen" blijft
      // staan i.p.v. over te schakelen naar de bestandsnaam
      if (fileUploadRef.value) {
        fileUploadRef.value.clear();
      }

      let url = null;
      try {
        url = await UittrekselStrafregisterService.haalVerificatieUrlOp(
          bestand
        );
      } catch (error) {
        url = null;
      }

      if (!url) {
        toast.add({
          severity: "warn",
          summary: "Uittreksel strafregister",
          detail:
            "Kan het uittreksel niet opladen: geen geldige verificatielink gevonden in dit bestand.",
          life: 8000,
        });
        return;
      }

      uploadDocument(url);
    };

    return {
      ...toRefs(state),
      stopAlleFuncties,
      opslaan,
      volledigeNaam,
      magFunctiesToevoegen,
      isEigenProfiel,
      wordtBinnenkortOudLid,
      moetUittrekselStrafregisterBezorgen,
      heeftFiscaalAttest,
      wijzigingen,
      teBekijkenLid,
      resetWatchable,
      changeGeg,
      updateFuncties,
      attestAfdrukken,
      lidkaartAfdrukken,
      voegFunctieToe,
      uploadUittrekselStrafregister,
      selecteerUittrekselStrafregister,
      fileUploadRef,
    };
  },
};
</script>

<style scoped></style>

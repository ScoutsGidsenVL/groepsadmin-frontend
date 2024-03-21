<template>
  <div>
    <SideMenu/>
    <confirmDialog/>
    <toast position="bottom-right"/>
    <div>
      <ingelogd-lid></ingelogd-lid>
    </div>
      <div class="container-fluid min-height-67vh mt-7em lg:mt-0">
        <div class="hidden lg:block md:ml-8 w-25">
          <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 md:ml-6 mb-8"/>
        </div>
        <Loader
          :showLoader="isLoadingActiviteiten"
        ></Loader>
        <div class="lg:ml-8">
          <div class="lg:ml-6">
            <div class="flex justify-content-end">
            <Button type="button" label="Activiteit toevoegen" @click="voegActivteitToe()" icon="far fa-plus"
                    class="actie-button mr-1"/>
            </div>
            <data-table
              ref="activiteitenlijst"
              :value="activiteiten"
              stripedRows
              showGridlines
              responsiveLayout="scroll"
              @row-click="registreerAanwezigheden"
              class="p-datatable-sm mt-4 activiteitentabel"
            >
              <column field="werkjaar" header="Werkjaar"></column>
              <column field="periode" header="Periode"></column>
              <column field="omschrijving" header="Omschrijving"></column>
              <column field="prijs" header="prijs"></column>
              <template #empty>
                Geen activiteiten gevonden.
              </template>

            </data-table>
          </div>
        </div>
      </div>
  </div>
  <Footer/>

</template>


<script>
import IngelogdLid from "@/components/lid/IngelogdLid.vue";
import SideMenu from "@/components/global/Menu.vue";
import Loader from "@/components/global/Loader.vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {toRefs} from "@vue/reactivity";
import ActiviteitenService from "@/services/activiteiten/ActiviteitenService";
import Footer from "@/components/global/Footer.vue";

export default {
  name: "Aanvragen",
  components: {
    Footer,
    Loader,
    ConfirmDialog,
    SideMenu,
    IngelogdLid
  },
  setup() {

    const {
      state,
      registreerAanwezigheden,
      voegActivteitToe
    } = ActiviteitenService.activiteitenSpace();

    return {
      ...toRefs(state),
      registreerAanwezigheden,
      voegActivteitToe
    }
  }
}

</script>


<style scoped>

</style>

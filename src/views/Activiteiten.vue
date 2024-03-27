<template>
  <div>
    <SideMenu/>
    <confirmDialog
      :message="dialogMessage"
      :header="dialogHeader"
      :dialog-visible="messageDialog"
      @confirm="bevestigVerwijderen"
      @cancel="annuleerVerwijderen"
    />
    <activiteitDialog :functies="functies" :dialog-visible="activiteitDialog" @close="activiteitDialog = false"
                      :groep="selectedGroep"/>
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
          <label class="d-flex justify-content-start">Betalende activiteiten</label>
          <div class="flex justify-content-between ">
            <div class="col-12 col-lg-6 col-xl-4 groep-select justify-content-start ml--2 " v-if="!groepenLaden">
              <BaseDropdown
                :options="groepenArray"
                :model-value="selectedGroep"
                @changeValue="veranderGroep"
              />
            </div>
            <div>
              <Button type="button" label="Activiteit toevoegen" @click="activiteitDialog = true" icon="far fa-plus"
                      class="actie-button mr-1 mt-3"/>
            </div>
          </div>
          <data-table
            ref="activiteitenlijst"
            :value="activiteiten"
            stripedRows
            :scrollable="true"
            showGridlines
            size="small"
            class="p-datatable-sm activiteitentabel"
          >
            <column field="werkjaar" header="Werkjaar" style="width: 50px">
              <template #body="slotProps">
                <div @click="registreerAanwezigheden(slotProps.data.id)" class="cursor-pointer">
                  {{ slotProps.data.werkjaar }}
                </div>
              </template>
            </column>
            <column field="periode" header="Periode" style="width: 250px">
              <template #body="slotProps">
                <div @click="registreerAanwezigheden(slotProps.data.id)" class="cursor-pointer">
                  {{ formatteerPeriode(slotProps.data) }}
                </div>
              </template>
            </column>
            <column field="omschrijving" header="Omschrijving" style="width: 400px">
              <template #body="slotProps">
                <div @click="registreerAanwezigheden(slotProps.data.id)" class="cursor-pointer ellipsis">
                  {{ slotProps.data.omschrijving }}
                </div>
              </template>
            </column>
            <column field="functies" header="Functies" style="width: 300px">
              <template #body="slotProps">
                <div @click="registreerAanwezigheden(slotProps.data.id)" class="cursor-pointer ellipsis">
                  {{ formatteerFunctieOmschrijving(slotProps.data.functies) }}
                </div>
              </template>
            </column>
            <column field="prijs" header="Prijs" style="width: 80px">
              <template #body="slotProps">
                <div @click="registreerAanwezigheden(slotProps.data.id)" class="cursor-pointer">
                  {{ slotProps.data.prijs }} €
                </div>
              </template>
            </column>
            <column field="acties" header="Acties" style="width: 150px">
              <template #body="slotProps">
                <div class="flex justify-content-between">
                  <i class="fas fa-users-medical mr-3 cursor-pointer" style="font-size: 1.5rem"
                     title="Leden toevoegen" @click="registreerAanwezigheden(slotProps.data.id)"></i>
                  <i class="fas fa-pencil mr-3 cursor-pointer" style="font-size: 1.5rem"
                     title="Activiteit bewerken" @click="wijzigActiviteit(slotProps.data)"></i>
                  <i class="fas fa-trash cursor-pointer" style="font-size: 1.5rem"
                     title="Activiteit verwijderen" @click="verwijderActiviteit(slotProps.data.id)"></i>
                </div>
              </template>
            </column>
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
import ActiviteitDialog from "@/components/dialog/ActiviteitDialog.vue";
import BaseDropdown from "@/components/input/BaseDropdown.vue";

export default {
  name: "Aanvragen",
  components: {
    BaseDropdown,
    Footer,
    Loader,
    ConfirmDialog,
    SideMenu,
    IngelogdLid,
    ActiviteitDialog
  },
  setup() {

    const {
      state,
      registreerAanwezigheden,
      wijzigActiviteit,
      veranderGroep,
      verwijderActiviteit,
      bevestigVerwijderen,
      annuleerVerwijderen,
      formatteerPeriode,
      formatteerFunctieOmschrijving
    } = ActiviteitenService.activiteitenSpace();

    return {
      ...toRefs(state),
      registreerAanwezigheden,
      wijzigActiviteit,
      veranderGroep,
      verwijderActiviteit,
      bevestigVerwijderen,
      annuleerVerwijderen,
      formatteerPeriode,
      formatteerFunctieOmschrijving
    }
  }
}

</script>


<style scoped>
.fa-pencil {
  color: blue;
}

.fa-trash {
  color: red;
}
</style>

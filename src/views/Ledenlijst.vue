<template>
  <div ref="scrollComponent">
    <SideMenu/>
    <confirmDialog/>
    <message-dialog message="Gelieve eerst leden te selecteren." header="Geen leden geselecteerd"
                    :dialog-visible="ledenDialog" @close="close"></message-dialog>
    <MessageDialog :dialog-visible="messageDialog" :message="messageDialogMessage" :header="messageDialogHeader" @close="messageDialog = false"/>

    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div>
      <div class="container-fluid min-height-67vh mt-7em lg:mt-0">
        <div class="hidden lg:block md:ml-8 w-25">
          <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 md:ml-6"/>
        </div>
        <Loader
          :showLoader="isLoading || isLoadingFilters" :title="loadingText"
        ></Loader>
        <div class="lg:ml-8">
          <div class="lg:ml-6">
            <div class="mt-9 flex justify-content-end lg:hidden">
              <lid-zoek-auto-complete></lid-zoek-auto-complete>
            </div>
            <LedenlijstFilterblok class="mt-6 mb-3" v-if="!isLoadingFilters"
                                  :actieveKolommen="actieveKolommen"
                                  :nonActieveKolommen="nonActieveKolommen"
                                  :filters="filters"
                                  @veranderFilter=veranderFilter
                                  @setActieveKolom="setActieveKolom"
                                  @setNonActieveKolom="setNonActieveKolom"
                                  @filterToepassen="filterToepassen"
                                  @filterOpslaan="filterOpslaan"
                                  @activateCriterium="activateCriterium"
                                  @deactivateCriterium="deactivateCriterium"
                                  @getHuidigeFilter="getHuidigeFilter"
                                  @onLoading="isLoading = true"
                                  @offLoading="isLoading = false"
                                  @activeerAlleFuncties="triggerActiveerAlleFuncties"
                                  @deactiveerAlleFuncties="triggerDeactiveerAlleFuncties"
                                  :huidigeFilter="huidigeFilter"
                                  :criteria="criteria"
                                  :active-criteria="activeCriteria"
            />
            <data-table
              ref="ledenlijst"
              :value="leden"
              stripedRows
              showGridlines
              responsiveLayout="scroll"
              @row-click="selectLid"
              @sort="addSort"
              @colum-click="addSort"
              class="p-datatable-sm mt-4 ledentabel"
            >
              <template #header>
                <div class="relative d-flex justify-content-end align-content-center h-auto">
                  <div class="block md:hidden">
                    <Button
                      type="button"
                      icon="pi pi-chevron-down"
                      @click="toggle"
                      aria-haspopup="true"
                      aria-controls="overlay_menu"
                      label="Acties"
                      class="actie-button "
                    />
                    <Menu id="overlay_menu" ref="menu" :model="filteredMenuItems" :popup="true">
                    </Menu>
                  </div>
                  <div class="hidden md:block">
                    <Button type="button" label="Nieuw lid" @click="gaNaar('lidToevoegen')" icon="far fa-user-plus"
                            class="actie-button mr-1" v-if="magNieuwLidAanmaken()"/>
                    <Button type="button" label="Etiketten" @click="gaNaar('etiket')" icon="pi pi-tags"
                            class="actie-button mr-1"/>
                    <Button type="button" label="Mail" @click="gaNaar('email')" icon="pi pi-envelope"
                            class="actie-button mr-1"/>
                    <Button type="button" label="Export" @click="toggleExport" aria-haspopup="true"
                            aria-controls="overlay_menu_export" class="actie-button">
                      <i class="pi pi-file-export"></i>
                      <span class="px-3">Export</span>
                      <i class="pi pi-chevron-down"></i>
                    </Button>
                    <Menu
                      id="overlay_menu_export"
                      ref="exportMenu"
                      :model="filteredexportMenuItems"
                      :popup="true"
                    />
                  </div>
                </div>
                <div class="d-flex justify-content-start">
                  <label class="float-start mt--25">
                    {{ totaalAantalLeden }} {{ totaalAantalLeden > 1 ? 'rijen' : 'rij' }}
                  </label>
                  <label v-if="aantalIds > 0" class="float-left mt--25 hidden md:block">&nbsp;( {{ this.aantalIds }}
                    {{ this.aantalIds === 1 ? "lid" : "leden" }} geselecteerd )
                  </label>
                </div>
                <div class="d-flex justify-content-start ">
                  <label v-if="aantalIds > 0" class="float-left mt--08 md:hidden">&nbsp;( {{ this.aantalIds }}
                    {{ this.aantalIds === 1 ? "lid" : "leden" }} geselecteerd )
                  </label>
                </div>
              </template>
              <template #empty>
                Geen leden gevonden op basis van de huidige filter.
              </template>
              <template #loading> Leden laden. Even geduld aub...</template>
              <column>
                <template #header>
                  <checkbox @click="selecteerOfDeselecteerAlleleden" v-model="alleLeden" :binary="true"></checkbox>
                </template>
                <template #body="slotProps">
                  <checkbox @click="$event.stopPropagation();
                                    voegLidToe(slotProps.data)"
                            v-model="geselecteerdeLeden"
                            :value="slotProps.data"></checkbox>
                </template>
              </column>
              <column
                v-for="kolom of actieveKolommen"
                :field="kolom.id"
                :header="kolom.label"
                :key="kolom.id"
                class="cursor-pointer cut-off-text-table"
              >
                <template #header class="sticky-top position-sticky sticky">
                  <div class="w-full" @click="addSort(kolom)" v-if="kolom.label !== 'Lidgeld betaald aan SGV'">
                    <div class="standard-order-icon ml-1" v-if="checkSortering(kolom) === -1">
                      <i class="fas fa-caret-down"></i>
                    </div>
                    <div class="standard-order-icon ml-1" v-else>
                      <i class="fas fa-sort-alpha-down"
                         :class="checkSortering(kolom) === 0 ? 'icon-large' :  checkSortering(kolom) === 2 ? 'icon-small' : ''"></i>
                    </div>
                  </div>
                </template>
                <template #body="slotProps">
                  <div v-if="!kolom.isLoaded" class="data-placeholder"></div>
                  <div v-if="kolom.type !== 'vinkje'" class="cursor-pointer">
                    {{ slotProps.data.waarden[kolom.id] }}
                  </div>
                  <div
                    v-if="kolom.type === 'vinkje'"
                    class="table-checkbox cursor-pointer"
                  >
                    <i
                      class="pi"
                      :class="{
                  'true-icon pi-check-circle': isWaardeTrue(
                    slotProps.data.waarden[kolom.id]
                  ),
                  'false-icon pi-times-circle': isWaardeFalse(
                    slotProps.data.waarden[kolom.id]
                  ),
                }"
                    ></i>
                  </div>
                </template>
              </column>
              <template #footer v-if="isLoadingMore">
          <span class="small mt-1"
          >Meer leden laden &nbsp;<i class="fas fa-spinner fa-spin"></i
          ></span>
              </template>
            </data-table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer/>
</template>

<script>
import LedenlijstFilterblok from "@/components/filter/LedenlijstFilterblok";
import Loader from "@/components/global/Loader";
import Footer from "@/components/global/Footer";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import Breadcrumb from "primevue/breadcrumb";
import MessageDialog from "@/components/dialog/MessageDialog";
import Ledenlijst from "@/services/leden/Ledenlijst";
import {toRefs} from "@vue/reactivity";
import {onMounted, ref} from 'vue'
import LidZoekAutoComplete from "@/components/global/LidZoekAutoComplete";

export default {
  name: "Ledenlijst",
  components: {
    LidZoekAutoComplete,
    Footer,
    Loader,
    LedenlijstFilterblok,
    ConfirmDialog,
    SideMenu,
    Breadcrumb,
    IngelogdLid,
    MessageDialog
  },

  setup() {
    const {
      state,
      activateCriterium,
      heeftSteekkaartleesRecht,
      gaNaar,
      deactivateCriterium,
      setNonActieveKolom,
      setActieveKolom,
      addSort,
      checkSortering,
      selectLid,
      veranderFilter,
      aantalLedenGeselecteerd,
      selecteerOfDeselecteerAlleleden,
      clearAlleLeden,
      selecteerLid,
      close,
      isWaardeTrue,
      isWaardeFalse,
      aantalIds,
      filteredMenuItems,
      filteredexportMenuItems,
      filterToepassen,
      filterOpslaan,
      getLeden,
      aantalLedenGeladen,
      menu,
      exportMenu,
      toggle,
      toggleExport,
      scrollComponent,
      voegLidToe,
      magNieuwLidAanmaken,
      isLidGeselecteerd,
      getHuidigeFilter,
      triggerActiveerAlleFuncties,
      triggerDeactiveerAlleFuncties
    } = Ledenlijst.ledenlijstSpace();


    const ledenlijst = ref(null);

    const handleScroll = () => {
      let element = scrollComponent.value;
      if (element && (element.getBoundingClientRect().bottom < window.innerHeight) && !state.isLoadingMore) {
        if (aantalLedenGeladen.value >= state.totaalAantalLeden) {
          return;
        }
        state.offset = aantalLedenGeladen.value;
        getLeden(state.offset);
      }
    }

    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
    })

    return {
      ...toRefs(state),
      activateCriterium,
      heeftSteekkaartleesRecht,
      toggle,
      toggleExport,
      gaNaar,
      deactivateCriterium,
      setNonActieveKolom,
      setActieveKolom,
      addSort,
      checkSortering,
      selectLid,
      veranderFilter,
      aantalLedenGeselecteerd,
      selecteerOfDeselecteerAlleleden,
      clearAlleLeden,
      selecteerLid,
      close,
      isWaardeTrue,
      isWaardeFalse,
      aantalIds,
      filteredMenuItems,
      filteredexportMenuItems,
      filterToepassen,
      filterOpslaan,
      getLeden,
      aantalLedenGeladen,
      ledenlijst,
      menu,
      exportMenu,
      scrollComponent,
      voegLidToe,
      magNieuwLidAanmaken,
      isLidGeselecteerd,
      getHuidigeFilter,
      triggerActiveerAlleFuncties,
      triggerDeactiveerAlleFuncties
    }
  },

};
</script>

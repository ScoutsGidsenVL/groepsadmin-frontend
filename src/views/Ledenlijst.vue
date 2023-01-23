<template>
  <div ref="scrollComponent">
    <SideMenu/>
    <confirmDialog/>
    <message-dialog message="Gelieve eerst leden te selecteren." header="Geen leden geselecteerd"
                    :dialog-visible="ledenDialog" @close="close"></message-dialog>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div>
      <div class="container-fluid min-height-67vh mt-7em lg:mt-0">
        <div class="hidden lg:block md:ml-8 w-50">
          <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 md:ml-6"/>
        </div>
        <Loader
          :showLoader="isLoading" :title="loadingText"
        ></Loader>
        <div class="lg:ml-8" >
          <div class="lg:ml-6">
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
                                  :huidigeFilter="huidigeFilter"
                                  :criteria="criteria"
                                  :active-criteria="activeCriteria"
            >
            </LedenlijstFilterblok>
            <data-table
              ref="ledenlijst"
              :lazy="true"
              :totalRecords="aantalLedenGeladen"
              :value="leden"
              stripedRows
              showGridlines
              responsiveLayout="scroll"
              v-model:selection="geselecteerdeLeden"
              @row-select-all="selecteerAlleLeden(0)"
              @row-unselect-all="clearAlleLeden"
              @row-select="selecteerLid"
              @row-unselect="selecteerLid"
              @row-click="selectLid"
              @sort="addSort"
              @colum-click="addSort"
              sort-mode="multiple"
              class="p-datatable-sm mt-4 ledentabel"
            >
              <template #header>
                <div class="relative mb-6 d-flex justify-content-end align-content-center mt--05">
                  <Button type="button" icon="pi pi-bars" @click="toggle" aria-haspopup="true"
                          aria-controls="overlay_menu"
                          class="sub-menu-button menu-button p-button-rounded mt--1"/>
                  <Menu id="overlay_menu" ref="menu" :model="filteredMenuItems" :popup="true"
                        class="sub-menu-items p-3 width-24">
                    <template #item="{item}">
                      <div @click="gaNaar(item.link)">
                        <i :class="item.icon" class="lid-menu-item mr-2"><label
                          class="cursor-pointer lid-menu-item font ml-2">{{ item.label }}</label></i>
                      </div>
                    </template>
                  </Menu>
                </div>

                <label class="float-start mt--1">
                  {{ totaalAantalLeden }} {{ totaalAantalLeden > 1 ? 'rijen' : 'rij' }}
                </label>
                <label v-if="aantalIds > 0" class="float-left mt--1"
                >&nbsp;( {{ this.aantalIds }}
                  {{ this.aantalIds === 1 ? "lid" : "leden" }} geselecteerd )</label
                >
              </template>
              <template #empty>
                Geen leden gevonden op basis van de huidige filter.
              </template>
              <template #loading> Leden laden. Even geduld aub...</template>
              <column
                selectionMode="multiple"
                :exportable="false"
                headerStyle="max-width: 38px"
                @click="selecteerLid"
                class="selecteerbaar"
              ></column>
              <column
                v-for="kolom of actieveKolommen"
                :field="kolom.id"
                :header="kolom.label"
                :key="kolom.id"
                class="cursor-pointer cut-off-text-table"
              >
                <template #header class="sticky-top position-sticky">
                  <div class="w-full" @click="addSort(kolom)" v-if="kolom.label !== 'Lidgeld betaald aan SGV'">
                    <div class="standard-order-icon ml-1" v-if="checkSortering(kolom) === -1">
                      <i class="fas fa-caret-down"></i>
                    </div>
                    <div class="standard-order-icon ml-1" v-else>
                      <i class="fas fa-sort-alpha-down"
                         :class="checkSortering(kolom) === 0 ? 'icon-large' :  checkSortering(kolom) === 2 ? 'icon-small' : ''"></i>
                    </div>
                    <!--                    <div class="custom-column" v-if="kolom.label === 'Lidgeld betaald aan SGV'">-->
                    <!--                      <a-->
                    <!--                        class="ml-1 float-right"-->
                    <!--                        href="https://wiki.scoutsengidsenvlaanderen.be/doku.php?id=handleidingen:groepsadmin:paginas:groepsinstellingen&s[]=verzekerd"-->
                    <!--                        target="_blank"-->
                    <!--                      >-->
                    <!--                        <i-->
                    <!--                          class="fa fa-question-circle resolve info-button"-->
                    <!--                          title="meer info"-->
                    <!--                          style="margin-left: 3px"-->
                    <!--                        ></i>-->
                    <!--                      </a>-->
                    <!--                    </div>-->
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

export default {
  name: "Ledenlijst",
  components: {
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
      selecteerAlleLeden,
      clearAlleLeden,
      selecteerLid,
      close,
      isWaardeTrue,
      isWaardeFalse,
      aantalIds,
      filteredMenuItems,
      filterToepassen,
      filterOpslaan,
      getLeden,
      aantalLedenGeladen,
      menu,
      toggle,
      scrollComponent
    } = Ledenlijst.ledenlijstSpace();


    const ledenlijst = ref(null);

    const handleScroll = () => {
      let element = scrollComponent.value;
      if (element.getBoundingClientRect().bottom < window.innerHeight && !state.isLoadingMore) {
        if (aantalLedenGeladen.value === state.totaalAantalLeden) {
              return;
        }
        state.offset = state.leden.length;
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
      gaNaar,
      deactivateCriterium,
      setNonActieveKolom,
      setActieveKolom,
      addSort,
      checkSortering,
      selectLid,
      veranderFilter,
      aantalLedenGeselecteerd,
      selecteerAlleLeden,
      clearAlleLeden,
      selecteerLid,
      close,
      isWaardeTrue,
      isWaardeFalse,
      aantalIds,
      filteredMenuItems,
      filterToepassen,
      filterOpslaan,
      getLeden,
      aantalLedenGeladen,
      ledenlijst,
      menu,
      scrollComponent
    }
  },

};
</script>

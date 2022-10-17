<template>
  <div>
    <SideMenu/>
    <confirmDialog/>
    <message-dialog message="Gelieve eerst leden te selecteren." header="Geen leden geselecteerd"
                    :dialog-visible="ledenDialog" @close="close"></message-dialog>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div>
      <div class="container-fluid min-height-67vh mt-7em lg:mt-0" ref="scrollComponent">
        <div class="hidden lg:block md:ml-8 w-50">
          <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 md:ml-6"/>
        </div>
        <Loader
          :showLoader="isLoadingLeden"
        ></Loader>
        <div class="md:ml-8">
          <div class="md:ml-6">
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
              @row-select-all="selecteerAlleLeden"
              @row-unselect-all="clearAlleLeden"
              @row-select="selecteerLid"
              @row-unselect="selecteerLid"
              @row-click="selectLid"
              @sort="addSort"
              @colum-click="addSort"
              sort-mode="multiple"
              class="p-datatable-sm mt-4"
              :scrollable="true"
              scroll-height="600px"
            >
              <template #header>
                <div class="top-menu d-flex justify-content-end align-content-center mt--05">
                  <Button type="button" icon="pi pi-bars" @click="toggle" aria-haspopup="true"
                          aria-controls="overlay_menu"
                          class="sub-menu-button menu-button p-button-rounded mt--1"/>
                  <Menu id="overlay_menu" ref="menu" :model="filteredMenuItems" :popup="true"
                        class="sub-menu-items p-3 width-24">
                    <template #item="{item}">
                      <div @click="gaNaar(item.link)">
                        <i :class="item.icon" class="lid-menu-item mr-2"><label
                          class="clickable lid-menu-item font ml-2">{{ item.label }}</label></i>
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
                headerStyle="width: 1em"
                @click="selecteerLid"
              ></column>
              <column
                v-for="kolom of actieveKolommen"
                :field="kolom.id"
                :header="kolom.label"
                :key="kolom.id"
                class="clickable cut-off-text-table"
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
                  <div v-if="kolom.type !== 'vinkje'" class="clickable">
                    {{ slotProps.data.waarden[kolom.id] }}
                  </div>
                  <div
                    v-if="kolom.type === 'vinkje'"
                    class="table-checkbox clickable"
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
import RestService from "@/services/api/RestService";
import store from "@/store";
import ErrorService from "@/services/api/ErrorService";
import LedenlijstFilterblok from "@/components/filter/LedenlijstFilterblok";
import Loader from "@/components/global/Loader";
import Footer from "@/components/global/Footer";
import ledenlijstFilter from "@/services/leden/ledenlijstFilter";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import Breadcrumb from "primevue/breadcrumb";
import ledenlijstService from "@/services/leden/ledenlijstService";
import rechtenService from "@/services/rechten/rechtenService";
import MessageDialog from "@/components/dialog/MessageDialog";

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
  data() {
    return {
      home: {icon: 'pi pi-home', to: '/dashboard'},
      breadcrumbItems: [
        {
          label: 'ledenlijst'
        },
      ],
      lidIds: new Set(),
      isLoadingFilters: true,
      isLoadingMore: false,
      isExporting: false,
      ledenDialog: false,
      isFilterCollapsed: false,
      isLoadingLeden: false,
      isSavingFilters: false,
      tableheaderIsSticky: true,
      hasLoadedFilters: false,
      dataLoaded: false,
      ledenAanLijstToevoegen: false,
      busy: false,
      end: false,
      offset: 0,
      totaalAantalLeden: 0,
      aantalPerPagina: 10,
      huidigeFilter: {},
      leden: [],
      actieveKolommen: [],
      filters: [],
      geselecteerdeLeden: [],
      deelFilter: false,
      criteria: [],
      activeCriteria: [],
      canPost: false,
      canShare: false,
      isVgaOfLeiding: false,
      alleGeselecteerd: false,
      menuItems: [
        {
          label: "Exporteren naar PDF",
          condition: true,
          icon: "fal fa-file-pdf",
          link: "pdf",
        },
        {
          label: "Exporteren naar CSV",
          condition: true,
          icon: "fal fa-file-csv",
          link: "csv",
        },
        {
          label: "E-mail versturen",
          condition: true,
          icon: "far fa-envelope",
          link: "email",
        },
        {
          label: "Etiketten maken",
          condition: true,
          icon: "far fa-tags",
          link: "etiket",
        },
        {
          label: "Individuele steekkaarten naar pdf",
          condition: this.heeftSteekkaartleesRecht,
          icon: "fal fa-file-pdf",
          link: "steekkaart",
        },
        {
          label: "Nieuw Lid",
          condition: rechtenService.hasAccess("nieuw lid"),
          icon: "far fa-user-plus",
          link: "lidToevoegen",
        },
      ],
    };
  },

  created() {
    this.getLeden();
    this.getHuidigeFilter();
    this.getFilters();
    window.addEventListener("scroll", this.handleScroll);
    this.emitter.on('changeGeslachtCriterium', (event) => {
      this.changeGeslachtCriterium(event.criteria, event.selectedOption);
    })
    this.emitter.on('changeOudLidCriterium', (event) => {
      this.changeOudLidCriterium(event.criteria, event.selectedOption);
    })
    this.emitter.on('setActieveKolom', (event) => {
      this.setActieveKolom(event.kolom);
    })
    this.emitter.on('changeGroepCriterium', (event) => {
      this.changeGroepCriterium(event.criteria, event.selectedOptions);
    })
    this.emitter.on('changeLeeftijd', (event) => {
      this.changeLeeftijd(event.criteria, event.leeftijdOpDatum, event.jongerDan, event.ouderDan);
    })
    this.emitter.on('changeSteekkaartCriterium', (event) => {
      this.changeIndividueleSteekkaart(event.criteria, event.aangepast, event.datum);
    })
    this.emitter.on('changeGegKeuzeCriterium', (event) => {
      this.changeGegKeuze(event.criteria, event.veld, event.waarde, event.operator);
    })
    this.emitter.on('deactiveerGroepseigenGegeven', (event) => {
      this.deactiveerGroepseigenGegeven(event.criteria, event.veld);
    })
    this.emitter.on('activeerAlleFuncties', (event) => {
      this.activeerAlleFuncties(event.criteria);
    })
    this.emitter.on('activeerFunctie', (event) => {
      this.activeerFunctie(event.criteria, event.functie);
    })
    this.emitter.on('activeerAlleGroepFuncties', (event) => {
      this.activeerAlleGroepFuncties(event.criteria, event.groepering);
    })
  },

  computed: {
    aantalLedenGeladen() {
      return this.leden.length;
    },

    aantalIds() {
      return this.lidIds.size;
    },

    filteredMenuItems() {
      return this.menuItems.filter(obj => {
        return obj.condition;
      });
    },
  },

  methods: {
    activateCriterium(criterium) {
      if (criterium.criteriaKey === 'adresgeblokkeerd' || criterium.criteriaKey === 'verminderdLidgeld' || criterium.criteriaKey === 'emailgeblokkeerd') {
        this.huidigeFilter.criteria[criterium.criteriaKey] = true;
      }
      criterium.activated = true;
      this.activeCriteria.unshift(criterium);
    },

    changeGeslachtCriterium(criteria, gekozenGeslacht) {
      this.huidigeFilter.criteria[criteria.criteriaKey] = gekozenGeslacht;
    },

    toggle(event) {
      this.$refs.menu.toggle(event);
    },

    deactiveerGroepseigenGegeven(criteria, veld) {
      if (this.huidigeFilter.criteria[criteria.criteriaKey]) {
        this.huidigeFilter.criteria[criteria.criteriaKey].forEach((item, index) => {
          if (item.veld === veld) {
            this.huidigeFilter.criteria[criteria.criteriaKey].splice(index, 1);
          }
        })
      }
    },

    heeftSteekkaartleesRecht() {
      setTimeout(() => {
        return rechtenService.heeftSteekkaartLeesrecht(this.$store.getters.profiel, 'steekkaart')
      }, 2000);
    },

    gaNaar(link) {
      if (link === 'pdf' || link === 'csv' || link === 'steekkaart') {
        if (this.geselecteerdeLeden.length < 1) {
          this.ledenDialog = true;
          return;
        }
        this.exporteer(link)
      } else if (link === 'email' || link === 'etiket') {
        if (this.geselecteerdeLeden.length < 1) {
          this.ledenDialog = true;
          return;
        }
        this.verstuur(link)
      } else {
        this.$router.push({name: link})
      }
    },

    changeLeeftijd(criteria, leeftijdOpDatum, jongerDan, ouderDan) {
      if (!this.huidigeFilter.criteria[criteria.criteriaKey]) {
        this.huidigeFilter.criteria[criteria.criteriaKey] = {};
      }
      this.huidigeFilter.criteria[criteria.criteriaKey].op31december = leeftijdOpDatum;
      this.huidigeFilter.criteria[criteria.criteriaKey].jongerdan = jongerDan;
      this.huidigeFilter.criteria[criteria.criteriaKey].ouderdan = ouderDan;
    },

    changeIndividueleSteekkaart(criteria, aangepast, datum) {
      if (!this.huidigeFilter.criteria[criteria.criteriaKey]) {
        this.huidigeFilter.criteria[criteria.criteriaKey] = {};
      }
      this.huidigeFilter.criteria[criteria.criteriaKey].operator = aangepast;
      this.huidigeFilter.criteria[criteria.criteriaKey].referentie = datum.toISOString().slice(0, 10);
    },

    changeGegKeuze(criteria, veld, waarde, operator) {
      let gegObject = {
        operator: operator,
        waarde: waarde,
        veld: veld
      }
      if (!this.huidigeFilter.criteria[criteria.criteriaKey]) {
        this.huidigeFilter.criteria[criteria.criteriaKey] = [];
      } else {
        this.huidigeFilter.criteria[criteria.criteriaKey].forEach((item, index) => {
          if (item.veld === veld) {
            this.huidigeFilter.criteria[criteria.criteriaKey].splice(index, 1);
          }
        })
      }
      this.huidigeFilter.criteria[criteria.criteriaKey].push(gegObject);
    },

    changeGroepCriterium(criteria, selectedOptions) {
      this.huidigeFilter.criteria[criteria.criteriaKey] = selectedOptions;
    },

    changeOudLidCriterium(criteria, keuze) {
      if (keuze === "alles") {
        this.huidigeFilter.criteria[criteria.criteriaKey] = null;
      } else {
        this.huidigeFilter.criteria[criteria.criteriaKey] = keuze;
      }
    },

    deactivateCriterium(criterium) {
      if (criterium.criteriaKey === 'adresgeblokkeerd' || criterium.criteriaKey === 'emailgeblokkeerd' || criterium.criteriaKey === 'verminderdLidgeld') {
        this.huidigeFilter.criteria[criterium.criteriaKey] = false;
      } else if (criterium.criteriaKey === 'geslacht' || criterium.criteriaKey === 'leeftijd' || criterium.criteriaKey === 'individuelesteekkaart') {
        this.huidigeFilter.criteria[criterium.criteriaKey] = undefined;
      } else {
        this.huidigeFilter.criteria[criterium.criteriaKey] = [];
      }
      let index = this.activeCriteria.indexOf(criterium);
      this.activeCriteria.splice(index, 1);
      criterium.activated = false;
    },

    setNonActieveKolom() {
      this.actieveKolommen = ledenlijstService.indexeerEnGroepeerKolommen(this.kolommen);
      this.nonActieveKolommen = ledenlijstService.indexeerEnGroepeerNonActieveKolommen(this.kolommen);
    },

    setActieveKolom(kolom) {
      if (kolom) {
        let index = this.huidigeFilter.sortering.indexOf(kolom.id);
        if (index > -1) {
          this.huidigeFilter.sortering.splice(index, 1);
        }
      }
      this.actieveKolommen = ledenlijstService.indexeerEnGroepeerKolommen(this.kolommen);
      this.nonActieveKolommen = ledenlijstService.indexeerEnGroepeerNonActieveKolommen(this.kolommen);
    },

    close() {
      this.ledenDialog = false;
    },

    checkSortering(kolom) {
      let mapping = {
        'be.vvksm.groepsadmin.model.column.VVKSMGroepsNamenColumn': 'be.vvksm.groepsadmin.model.column.VVKSMGroepenColumn',
        'be.vvksm.groepsadmin.model.column.VVKSMGroepsNummersColumn': 'be.vvksm.groepsadmin.model.column.VVKSMGroepenColumn',
        'be.vvksm.groepsadmin.model.column.LeeftijdColumn': 'be.vvksm.groepsadmin.model.column.GeboorteDatumColumn'
      };

      let kolomnaam = kolom.id;
      if (kolom.sorteringsIndex === -1 && mapping[kolom.id] !== undefined) {
        kolomnaam = mapping[kolom.id];
      }
      return this.huidigeFilter.sortering.indexOf(kolomnaam);
    },

    filterToepassen() {
      this.isLoadingLeden = true;
      this.offset = 0;
      let actKolommen = [];
      this.actieveKolommen.forEach(kolom => {
        actKolommen.push(kolom.id);
      })
      this.huidigeFilter.kolommen = actKolommen;
      RestService.patchHuidigeFilter(this.huidigeFilter)
        .then(res => {
          this.huidigeFilter = res.data;
          this.leden = [];
          this.getLeden();
          this.getFilters();
          ledenlijstFilter.getCriteria();
          this.activeerKolommen();
        })

    },

    addSort(kolom) {
      if (this.checkSortering(kolom) === -1) {
        this.huidigeFilter.sortering.unshift(kolom.id)
        this.huidigeFilter.sortering.splice(3);
      }
      kolom.sorteringsIndex = this.checkSortering(kolom);
      this.filterToepassen();
    },

    veranderFilter(filter) {
      this.leden = [];
      this.isLoadingLeden = true
      if (this.huidigeFilter.id !== filter.id) {
        RestService.getFilterOpId(filter.id)
          .then(res => {
            if (res.status === 200) {
              let nieuweFilter = {
                criteria: res.data.criteria,
                groepen: res.data.groepen,
                kolommen: res.data.kolommen,
                links: res.data.links,
                sortering: res.data.sortering,
                type: res.data.type
              }
              RestService.patchHuidigeFilter(nieuweFilter)
                .then(res => {
                  this.huidigeFilter = res.data;
                  this.offset = 0;
                  this.getLeden();
                  this.getKolommen();
                })
            }
          })
      }
    },

    activeerAlleFuncties(criteria) {
      console.log('activeer alle functies')
      console.log(criteria);
    },

    activeerFunctie(criteria, functie) {
      if (!this.huidigeFilter.criteria[criteria.criteriaKey]) {
        this.huidigeFilter.criteria[criteria.criteriaKey] = [];
      }
      if (this.huidigeFilter.criteria[criteria.criteriaKey].includes(functie.value)) {
        let index = this.huidigeFilter.criteria[criteria.criteriaKey].indexOf(functie.value);
        this.huidigeFilter.criteria[criteria.criteriaKey].splice(index, 1);
      } else {
        this.huidigeFilter.criteria[criteria.criteriaKey].push(functie.value);
      }
    },

    activeerAlleGroepFuncties(criteria, groepering) {
      console.log('activeer alle groepsfuncties')
      console.log(criteria);
      console.log(groepering);
    },

    selectLid(event) {
      if (
        event.originalEvent.target.className !== "p-selection-column" &&
        event.originalEvent.target.className !== "p-checkbox-icon"
      ) {
        this.$router.push({name: "Lid", params: {id: event.data.id}});
      }
    },

    getLeden() {
      this.offset === 0
        ? (this.isLoadingLeden = true)
        : (this.isLoadingMore = true);
      RestService.getLeden(this.offset)
        .then((res) => {
          this.aantalLedenGeladen = res.data.aantal;
          this.totaalAantalLeden = res.data.totaal;
          res.data.leden.forEach((lid) => {
            this.leden.push(lid);
          });
          this.offset = this.leden.length;
          this.filterLeden();
        })
        .catch((error) => {
          console.log(error);
          this.error = true;
          this.$toast.add({
            severity: "error",
            summary: "Ophalen leden",
            detail: error.message,
            life: 8000,
          });
        })
        .finally(() => {
          this.isLoadingLeden = false;
          this.isLoadingMore = false;
        });
    },

    getKolommen() {
      this.kolommen = store.getters.kolommen;
      if (!this.kolommen) {
        RestService.getKolomType().then((res) => {
          this.kolommen = res.data.kolommen;
          store.commit("setKolommen", res.data.kolommen);
          this.activeerKolommen();
          this.isLoadingLeden = false;
        });
      } else {
        this.activeerKolommen();
      }
    },

    getFilters() {
      RestService.getFilters().then(res => {
        this.filters = ledenlijstFilter.groepeerFilters(res.data.filters)
      }).catch(error => {
        console.log(error)
      })
    },

    handleScroll() {
      if (
        this.$refs.scrollComponent &&
        this.$refs.scrollComponent.getBoundingClientRect().bottom <
        window.innerHeight &&
        !this.isLoadingMore
      ) {
        if (this.aantalLedenGeladen === this.totaalAantalLeden) {
          return;
        }
        if (this.aantalLedenGeladen < this.totaalAantalLeden) {
          this.offset = this.leden.length;
          this.getLeden();
        }
      }
    },

    getHuidigeFilter() {
      this.isLoadingFilters = true;
      RestService.getHuidigeFilter()
        .then((res) => {
          this.huidigeFilter = res.data;
          this.getKolommen();
          this.criteria = ledenlijstFilter.getCriteria();
          this.activeCriteria = ledenlijstFilter.getActieveCriteria(this.huidigeFilter, this.criteria);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.isLoadingFilters = false;
        });
    },

    activeerKolommen() {
      this.actieveKolommen = ledenlijstService.activeerKolommen(this.huidigeFilter, this.kolommen);
      this.nonActieveKolommen = ledenlijstService.indexeerEnGroepeerNonActieveKolommen(this.kolommen);
    },

    exporteer(type) {
      if (this.geselecteerdeLeden.length) {
        this.filterLeden();
      }
      let ledenIds = {
        lidIds: Array.from(this.lidIds),
      };

      if (this.lidIds.size > 0) {
        this.isLoadingLeden = true;
        if (type === "csv") {
          RestService.getLedenCsv(0, ledenIds)
            .then((res) => {
              let obj = {};
              let blob = new Blob([res.data], {type: "text/csv"});
              obj.fileUrl = window.URL.createObjectURL(blob);
              obj.title = "ledenlijst.csv";
              this.downloadFile(obj);
            }).catch((error) => {
            console.log(error);
          }).finally(() => {
            this.isLoadingLeden = false;
          });
        }
        if (type === "pdf") {
          RestService.getLedenPdf(0, ledenIds)
            .then((res) => {
              if (res.data) {
                let obj = {};
                let blob = new Blob([res.data], {type: "application/pdf"});
                obj.fileUrl = window.URL.createObjectURL(blob);
                obj.title = "ledenlijst.pdf";
                this.downloadFile(obj);
              }
            }).catch((error) => {
            console.log(error);
          }).finally(() => {
            this.isLoadingLeden = false;
          })
        }
        if (type === "steekkaart") {
          RestService.getLedenSteekkaartPdf(ledenIds)
            .then((res) => {
              if (res.data) {
                let obj = {};
                let blob = new Blob([res.data], {type: "application/pdf"});
                obj.fileUrl = window.URL.createObjectURL(blob);
                obj.title = "steekkaarten.pdf";
                this.downloadFile(obj);
              }
            }).catch((error) => {
            let result = ErrorService.handleError(error);
            this.$toast.add({
              severity: result.severity,
              summary: result.summary,
              detail: result.detail,
              life: 8000,
            });
          }).finally(() => {
            this.isLoadingLeden = false;
          })
        }
      }
    },

    downloadFile(obj) {
      var a = document.createElement("a");
      a.href = obj.fileUrl;
      a.download = obj.title;
      document.body.appendChild(a);
      a.click();
    },

    filterLeden() {
      this.lidIds = new Set();
      this.geselecteerdeLeden.forEach((lid) => {
        this.lidIds.add(lid.id);
      });
    },

    aantalLedenGeselecteerd() {
      return this.geselecteerdeLeden.length;
    },

    selecteerAlleLeden() {
      this.getLeden();
    },

    clearAlleLeden() {
      this.lidIds.clear();
    },

    selecteerLid() {
      this.filterLeden();
    },

    verstuur(type) {
      this.filterLeden();
      store.commit("setGeselecteerdeLeden", this.geselecteerdeLeden);
      store.commit("setLidIds", this.lidIds);
      if (type === "email") {
        this.$router.push({name: "Mail"});
      }
      if (type === "etiket") {
        this.$router.push({name: "Etiket"});
      }
    },

    isWaardeTrue(value) {
      return value === '<input type="checkbox" disabled checked/>';
    },

    isWaardeFalse(value) {
      return value === '<input type="checkbox" disabled/>';
    },
  },
};
</script>

<style scoped></style>

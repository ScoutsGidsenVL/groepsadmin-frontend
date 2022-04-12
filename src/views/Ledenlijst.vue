<template>
  <div>
    <div class="container-fluid" ref="scrollComponent">
      <div class="hidden lg:block md:ml-8">
        <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 md:ml-6"/>
      </div>
      <Loader
        :showLoader="isLoadingLeden"
      ></Loader>
      <div class="mt-8 md:ml-8">
        <div class="md:ml-6">
          <LedenlijstFilterblok class="mt-6 mb-3"
                                :actieveKolommen="actieveKolommen"
                                :filters="filters"
                                @veranderFilter=veranderFilter
          >
          </LedenlijstFilterblok>
          <data-table
            ref="ledenlijst"
            :lazy="true"
            :autoLayout="true"
            :totalRecords="aantalLedenGeladen"
            :value="leden"
            stripedRows
            responsiveLayout="scroll"
            v-model:selection="geselecteerdeLeden"
            columnResizeMode="fit"
            @row-select-all="selecteerAlleLeden"
            @row-unselect-all="clearAlleLeden"
            @row-select="selecteerLid"
            @row-unselect="selecteerLid"
            @row-click="selectLid"
          >
            <template #header>
              <div class="d-flex justify-content-end">
                <Button
                  icon="far fa-envelope"
                  :disabled="geselecteerdeLeden.length === 0"
                  class="p-button-rounded p-button-alert mr-2 mail-button"
                  title="Mail leden"
                  @click="verstuur('mail')"
                />
                <Button
                  icon="fas fa-tags"
                  :disabled="geselecteerdeLeden.length === 0"
                  class="p-button-rounded p-button-alert mr-2 mail-button"
                  title="Etiketten maken"
                  @click="verstuur('etiket')"
                />
                <Button
                  icon="far fa-file-pdf"
                  :disabled="geselecteerdeLeden.length === 0"
                  class="p-button-rounded p-button-alert mr-2 export-button"
                  title="Exporteer naar pdf"
                  @click="exporteer('pdf')"
                />
                <Button
                  icon="far fa-file-csv"
                  :disabled="geselecteerdeLeden.length === 0"
                  class="p-button-rounded p-button-alert mr-2 export-button"
                  title="Exporteer naar csv"
                  @click="exporteer('csv')"
                />
                <Button
                  icon="far fa-file-alt"
                  :disabled="geselecteerdeLeden.length === 0"
                  class="p-button-rounded p-button-alert mr-2 export-button"
                  title="Exporteer steekkaarten naar pdf"
                  @click="exporteer('steekkaart')"
                />
              </div>
              <label class="float-start mt--1">
                {{ totaalAantalLeden }} {{totaalAantalLeden > 1 ? 'rijen' : 'rij' }}
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
              headerStyle="width: 3em"
              @click="selecteerLid"
            ></column>
            <column
              v-for="kolom of actieveKolommen"
              :field="kolom.field"
              :header="kolom.header"
              :key="kolom.field"
            >
              <template #header class="sticky-top position-sticky">
                <div class="custom-column">
                  <a
                    v-if="kolom.header === 'Lidgeld betaald aan SGV'"
                    class="ml-1 float-right"
                    href="https://wiki.scoutsengidsenvlaanderen.be/doku.php?id=handleidingen:groepsadmin:paginas:groepsinstellingen&s[]=verzekerd"
                    target="_blank"
                  >
                    <i
                      class="fa fa-question-circle resolve info-button"
                      title="meer info"
                      style="margin-left: 3px"
                    ></i>
                  </a>
                </div>
              </template>
              <template #body="slotProps">
                <div v-if="kolom.type !== 'vinkje'" class="clickable">
                  {{ slotProps.data.waarden[kolom.field] }}
                </div>
                <div
                  v-if="kolom.type === 'vinkje'"
                  class="table-checkbox clickable"
                >
                  <i
                    class="pi"
                    :class="{
                  'true-icon pi-check-circle': isWaardeTrue(
                    slotProps.data.waarden[kolom.field]
                  ),
                  'false-icon pi-times-circle': isWaardeFalse(
                    slotProps.data.waarden[kolom.field]
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

export default {
  name: "Ledenlijst",
  components: {
    Footer,
    Loader,
    LedenlijstFilterblok,
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
      leden: [],
      actieveKolommen: [],
      filters: [],
      geselecteerdeLeden: [],
      deelFilter: false,

      canPost: false,
      canShare: false,
      isVgaOfLeiding: false,
      alleGeselecteerd: false,
      indicator: {
        isLoading: false,
        canCancel: false,
        fullPage: true,
        useSlot: false,
      },
    };
  },

  created() {
    this.getLeden();
    this.getHuidigeFilter();
    this.getFilters();
    window.addEventListener("scroll", this.handleScroll);
  },

  methods: {
    addSort(kolom) {
      console.log(kolom);
    },

    voegLidToeAanLijst(lid) {
      console.log(lid);
    },

    checkLidInLijst(lid) {
      console.log(lid);
    },

    veranderFilter(filter) {
      this.leden= [];
      this.isLoadingLeden = true
      if (this.huidigeFilter.id !== filter.id){
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
        console.log(this.filters)
      }).catch(error => {
        console.log(error)
        console.log(" er ging iets vreselijks mis met het ophalen van de filters")
      })
    },

    onColReorder() {
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
      RestService.getHuidigeFilter()
        .then((res) => {
          this.huidigeFilter = res.data;
          this.getKolommen();
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
        });
    },

    activeerKolommen() {
      this.actieveKolommen = [];
      this.huidigeFilter.kolommen.forEach((filterKolom) => {
        this.kolommen.forEach((kolom) => {
          if (kolom && kolom.id === filterKolom) {
            this.actieveKolommen.push({
              field: kolom.id,
              header: kolom.label,
              type: kolom.type,
            });
          }
        });
      });
    },

    exporteer(type) {
      this.indicator.isLoading = true;
      if (this.geselecteerdeLeden.length) {
        this.filterLeden();
      }
      let ledenIds = {
        lidIds: Array.from(this.lidIds),
      };

      if (this.lidIds.size > 0) {
        if (type === "csv") {
          RestService.getLedenCsv(0, ledenIds)
            .then((res) => {
              let obj = {};
              let blob = new Blob([res.data], {type: "text/csv"});
              obj.fileUrl = window.URL.createObjectURL(blob);
              obj.title = "ledenlijst.csv";
              this.downloadFile(obj);
            })
            .catch((error) => {
              console.log(error);
            })
            .finally(() => {
              this.indicator.isLoading = false;
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
            })
            .catch((error) => {
              console.log(error);
            })
            .finally(() => {
              this.indicator.isLoading = false;
            });
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
            })
            .catch((error) => {
              let result = ErrorService.handleError(error);
              this.$toast.add({
                severity: result.severity,
                summary: result.summary,
                detail: result.detail,
                life: 8000,
              });
            })
            .finally(() => {
              this.indicator.isLoading = false;
            });
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
      if (type === "mail") {
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

  computed: {
    gefilterdeKolommen(kolom) {
      return kolom.activated;
    },

    aantalLedenGeladen() {
      return this.leden.length;
    },

    aantalIds() {
      return this.lidIds.size;
    },
  },
};
</script>

<style scoped></style>

<template>
  <div>
    <SideMenu/>
    <confirmDialog/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div>
      <Loader
        :showLoader="isLoadingGegevens"
      ></Loader>
      <div class="lg:ml-6">
        <div class="p-4 lg:ml-8">
          <Button
            icon="pi pi-save"
            class="p-button-rounded p-button-warning float-right mr-2 position-sticky save-button"
            v-show="changes"
            @click="save"
            :class="changes ? 'animate' : ''"
            :disabled="erZijnErrors"
          />
          <div class="row">
            <div
              class="pull-left d-flex flex-column float-left text-align-left ml-3"
            >
              <h3 class="panel-title">Individuele steekkaart</h3>
              <p class="panel-subtitle">
                {{ teBekijkenLid.vgagegevens.voornaam }}
                {{ teBekijkenLid.vgagegevens.achternaam }}
              </p>
              <p class="panel-subtitle">
                Geboortedatum: {{ teBekijkenLid.vgagegevens.geboortedatum }}
              </p>
              <p class="panel-subtitle">
                Laatste aanpassing:
                {{ teBekijkenLid.vgagegevens.individueleSteekkaartdatumaangepast }}
              </p>
            </div>
          </div>
          <div class="row mt-5">
            <div class="col-12">
              <form>
                <accordion :multiple="true" v-model:activeIndex="activeIndex">
                  <accordionTab
                    v-for="(groep, index) in layoutGroepen"
                    :key="index"
                  >
                    <template #header>
                      <div class="d-flex col-12 justify-content-between">
                        <span class="text-align-left">{{ groep[0].label }}</span>
                      </div>
                    </template>
                    <p
                      v-html="groep[0].beschrijving"
                      class="text-align-left beschrijving font-bold"
                    ></p>
                    <DynamischVeld
                      :model-value="steekkaartWaarden"
                      :veld="groep"
                      :errors="errors"
                      @changeValue="changeValue"
                      class="text-align-left"
                    ></DynamischVeld>
                  </accordionTab>
                </accordion>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RestService from "@/services/api/RestService";
import DynamischVeld from "@/components/input/DynamischVeld";
import Loader from "@/components/global/Loader";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

export default {
  name: "IndividueleSteekkaart",
  components: {
    DynamischVeld,
    Loader,
    SideMenu,
    ConfirmDialog,
    IngelogdLid
  },
  data() {
    return {
      id: "",
      eigenProfiel: false,
      isLoadingGegevens: false,
      error: false,
      steekkaart: null,
      activeIndex: [0],
      lid: {
        voornaam: "",
        achternaam: "",
        email: "",
        gebruikersnaam: "",
        links: [],
        persoonsgegevens: {},
        vgagegevens: {},
        verbondsgegevens: {},
      },
      steekkaartWaarden: null,
      layout: null,
      layoutGroepen: [],
      changes: false,
      errors: {},
    };
  },
  mounted() {
    this.emitter.on('changeGeg', () => {
      console.log('changes true')
      this.changes = true;
    })
    this.id = this.$route.params.id;
    this.isLoadingGegevens = true;
    RestService.getIndividueleSteekkaart(this.id)
      .then((response) => {
        this.steekkaartWaarden = response.data.gegevens.waarden;
        this.layout = response.data.gegevens.schema;
        if (this.id === this.$store.getters.profiel.id) {
          this.eigenProfiel = true;
        }
        this.sorteer();
        this.groepeer();
        this.setActiveIndexen();
        this.changes = false;
        this.checkForm();
        this.isLoadingGegevens = false;
      })
      .catch(error => {
        if (error.response.status === 403) {
          this.$toast.add({
            severity: "error",
            summary: error.response.data.titel,
            detail: error.response.data.beschrijving,
            life: 8000,
          });
          this.$router.push({name: "Dashboard"});
        }
      });

    RestService.getLid(this.id).then((response) => {
      this.lid = response.data;
    });
  },

  watch: {
    steekkaartWaarden: {
      handler: function (oldValue, newValue) {
        if (newValue) {
          this.changes = true;
          this.checkForm();
        }
      },
      deep: true,
    },
  },

  methods: {
    sorteer() {
      this.layout.sort(function (a, b) {
        if (a.sort < b.sort) return -1;
        if (a.sort > b.sort) return 1;
        return 0;
      });
    },

    setHeader(groep) {
      return groep.label;
    },

    changeValue(veld, waarde) {
      console.log('changed')
      this.changes = true;
      this.steekkaartWaarden[veld] = waarde;
      this.checkForm();
    },

    groepeer() {
      let tempGroup = [];
      this.layoutGroepen = [];

      this.layout.forEach((value, index) => {
        if (value.type === "groep") {
          if (tempGroup.length === 0) {
            tempGroup.push(value);
          } else {
            this.layoutGroepen.push(tempGroup);
            tempGroup = [];
            tempGroup.push(value);
          }
        } else {
          tempGroup.push(value);
          if (index === this.layout.length - 1) {
            this.layoutGroepen.push(tempGroup);
          }
        }
      });
    },

    setActiveIndexen() {
      this.layoutGroepen.forEach((groep, index) => {
        this.activeIndex.push(index);
      });
    },

    save() {
      let data = {
        gegevens: {},
      };
      this.checkForm();
      if (!this.erZijnErrors) {
        this.isLoadingGegevens = true;
        data.gegevens.waarden = this.steekkaartWaarden;
        RestService.saveIndividueleSteekkaart(this.id, data)
          .then((response) => {
            this.steekkaartWaarden = response.data.gegevens.waarden;
            this.layout = response.data.gegevens.schema;
            if (this.id === this.$store.getters.profiel.id) {
              this.eigenProfiel = true;
            }
            this.sorteer();
            this.groepeer();
            this.setActiveIndexen();
            this.$toast.add({
              severity: "success",
              summary: "Wijzigingen",
              detail: "Wijzigingen opgeslagen",
              life: 3000,
            });
          })
          .catch((error) => {
            this.error = true;
            this.$toast.add({
              severity: "error",
              summary: "Wijzigingen",
              detail: "Er is iets misgegaan bij het opslaan",
              life: 8000,
            });
            console.log(error);
          })
          .finally(() => {
            if (!this.error) {
              this.changes = false;
            }
            this.isLoadingGegevens = false;
          });
      }
    },

    checkForm() {
      this.errors = {};
      this.layout.forEach((veld) => {
        if (veld.verplicht) {
          if (!this.steekkaartWaarden[veld.id]) {
            this.errors[veld.id] = "required";
          }
        }
      });
    },
  },

  computed: {
    teBekijkenLid() {
      return this.lid;
    },
    erZijnErrors() {
      return Object.keys(this.errors).length > 0;
    },
  },

  beforeRouteLeave(to, from, next) {
    if (this.changes) {
      this.$confirm.require({
        message:
          "Je hebt niet opgeslagen wijzigingen. Ben je zeker dat je wil doorgaan?",
        header: "Wijzigingen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          next();
        },
        reject: () => {
          next(false);
        },
      });
    } else {
      next();
    }
  },
};
</script>

<style scoped></style>

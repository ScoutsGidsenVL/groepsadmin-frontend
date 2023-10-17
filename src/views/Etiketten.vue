<template>
  <div class="p-1">
    <SideMenu/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <etiket-info-dialog :dialog-visible="openEtikettenFoto" @close="sluitInfodialog"/>
    <div class="lg:ml-8">
      <ConfirmDialog/>
      <Loader :show-loader="laden"></Loader>
      <div class="overflow-hidden  lg:ml-6">
        <div>
          <save-template-dialog
            :open="openModal"
            :sjablonen="sjablonen"
            @closeModal="closeModal"
            @opslaan="opslaan"
          ></save-template-dialog>
        </div>
        <h4
          class="text-align-left mt-5 ml-1 pl-lg-2-5em custom-title font-weight-bold"
        >
          Etiketten
        </h4>
        <div class="pl-lg-4em mt-2">
          <div class="row">
            <div class="col-lg-6 text-align-left">
              <label>Opgeslagen sjablonen:</label>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-lg-3 text-align-left">
              <dropdown
                :options="gesorteerdeSjablonen(sjablonen)"
                v-model="sjabloon"
                optionLabel="label"
                optionValue="value"
                class="full-width sjabloon-dropdown"
              >
              </dropdown>
            </div>
            <div class="col-lg-2 text-align-left"
                 v-if="sjabloon && (sjabloon.naam !== 'deelnamebewijs' && sjabloon.naam !== 'blanco sjabloon' && sjabloon.naam !== 'STANDAARD' && sjabloon.naam !== 'standaard formaat')">
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-alert mr-2 position-sticky verwijder-button"
                title="Verwijder huidig sjabloon"
                @click="remove"
              />
            </div>
          </div>
          <div class="row mt-1">
            <div class="col-sm-2 text-align-left">
              <label
              >Ontvangers:
                <span v-if="leden.length > 0">
                {{
                    leden.length === 1 ? "1 lid" : leden.length + " leden"
                  }}</span
                ><span
                  v-if="leden.length > 0"
                  @click="toonLeden"
                  class="cursor-pointer custom-title"
                >
                (details)</span
                >
                <span v-if="isLoadingLeden" class="mt-1"
                >Leden ophalen &nbsp;<i class="fas fa-spinner fa-spin"></i
                ></span>
              </label>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-8 text-align-left">
              <checkbox :binary=true v-model="sjabloon.familie" id="familie" class="mt--3p"></checkbox>
              <label class="mt-1 ml-3" for="familie">Familie</label>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-8 text-align-left">
              <checkbox :binary=true v-model="sjabloon.alleAdressen" id="alleAdressen" class="mt--3p"></checkbox>
              <label class="mt-1 ml-3" for="alleAdressen">Alle adressen</label>
            </div>
          </div>
          <div class="d-flex justify-content-end mr-7">
            <Button
              icon="pi pi-save"
              class="p-button-rounded p-button-warning float-right mr-2 position-sticky save-button ml-2"
              title="Bewaar huidig sjabloon"
              @click="openSjabloonModel"
            />
            <Button
              icon="far fa-print"
              title="Print etiket"
              class="p-button-rounded p-button-warning float-right mr-2 position-sticky send-button ml-2"
              @click="print"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-12 pl-lg-5em pr-lg-5em">
            <Editor
              :init="getOptions"
              api-key="1o4al3jtztab1wf2880j7iio0hww1b4c6ut5qjqan57p3j4f"
              v-model="sjabloon.inhoud"
            ></Editor>
          </div>
        </div>
        <div class="pl-lg-4em mt-5">
          <h4 class="text-align-left mt-5 custom-title font-weight-bold">
            Etiket eigenschappen
            <span class="help-button-wrapper small cursor-pointer" @click="openFoto"
            >&nbsp; (klik hier voor schema)</span
            >
          </h4>
          <div class="row">
            <div class="col-lg-6 text-align-left">
              <BaseInput
                label="Grootte horizontaal"
                v-model="sjabloon.grootte.horizontaal"
                type="number"
              ></BaseInput>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-6 text-align-left">
              <BaseInput
                label="Grootte verticaal"
                v-model="sjabloon.grootte.verticaal"
                type="number"
              ></BaseInput>
            </div>
          </div>

          <div class="row">
            <div class="col-lg-6 text-align-left">
              <BaseInput
                label="Marge horizontaal"
                v-model="sjabloon.marge.horizontaal"
                type="number"
              ></BaseInput>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-6 text-align-left">
              <BaseInput
                label="Marge verticaal"
                v-model="sjabloon.marge.verticaal"
                type="number"
              ></BaseInput>
            </div>
          </div>

          <div class="row">
            <div class="col-lg-6 text-align-left">
              <BaseInput
                label="Tussenruimte horizontaal"
                v-model="sjabloon.tussenruimte.horizontaal"
                type="number"
              ></BaseInput>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-6 text-align-left">
              <BaseInput
                label="Tussenruimte verticaal"
                v-model="sjabloon.tussenruimte.verticaal"
                type="number"
              ></BaseInput>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-6 text-align-left">
              <BaseInput
                label="Blanco etiketten"
                v-model="sjabloon.blanco"
                type="number"
                help-link="https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:etiketten"
              ></BaseInput>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Dialog
          header="Ontvangers"
          v-model:visible="openOntvangerDialog"
          :style="{ width: '50vw', 'max-height': '30vw', 'min-height': 'fit-content' }"
          :modal="true"
        >
          <div class="email-leden col-xs-12">
            <ul>
              <li v-for="(lid, index) in leden" :key="index">
                <span v-if="lid.voornaam"> &nbsp;{{ lid.voornaam }} </span>
                <span v-if="lid.achternaam">&nbsp;{{ lid.achternaam }}</span>
                <span v-if="!lid.voornaam && !lid.achternaam && lid.volledigenaam"
                >&nbsp;{{ lid.volledigenaam }}
              </span>
                <span
                  v-if="!lid.voornaam && !lid.achternaam && !lid.volledigenaam"
                >
                - geen naam beschikbaar -
              </span>
              </li>
            </ul>
          </div>
        </Dialog>
      </div>
    </div>
  </div>
  <Footer/>
</template>

<script>
import BaseInput from "@/components/input/BaseInput";
import Editor from "@tinymce/tinymce-vue";
import SaveTemplateDialog from "@/components/mail/SaveTemplateDialog";
import RestService from "@/services/api/RestService";
import store from "@/store";
import Dialog from "primevue/dialog";
import Loader from "@/components/global/Loader";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import EtiketInfoDialog from "@/components/dialog/EtiketInfoDialog";
import Footer from "@/components/global/Footer";
import ConfirmDialog from 'primevue/confirmdialog';

export default {
  name: "Etiketten",
  components: {
    Footer,
    EtiketInfoDialog,
    BaseInput,
    Editor,
    SaveTemplateDialog,
    Loader,
    Dialog,
    SideMenu,
    IngelogdLid,
    ConfirmDialog
  },
  data() {
    return {
      changes: false,
      error: false,
      errors: [],
      geselecteerdeLeden: [],
      isLoadingLeden: false,
      laden: false,
      kolommen: [],
      kolommenLaden: false,
      leden: [],
      lidIds: new Set(),
      offset: 0,
      openEtikettenFoto: false,
      openOntvangerDialog: false,
      openModal: false,
      totaalAantalLeden: 0,
      saved: false,
      sorteerLeden: false,
      tempSjabloon: null,
      sjabloon: {
        naam: "",
        lidIds: [],
        blanco: 0,
        inhoud: "",
        alleAdressen: false,
        familie: false,
        aantalEtikettenPerRij: 1,
        aantalRijenPerPagina: 1,
        grootte: {
          horizontaal: 195,
          verticaal: 287,
        },
        marge: {
          horizontaal: 10,
          verticaal: 1,
        },
        tussenruimte: {
          horizontaal: 0,
          verticaal: 0,
        },
      },
      defaultSjabloon: {
        naam: "",
        lidIds: [],
        blanco: 0,
        inhoud: "",
        alleAdressen: false,
        familie: false,
        aantalEtikettenPerRij: 1,
        aantalRijenPerPagina: 1,
        grootte: {
          horizontaal: 195,
          verticaal: 287,
        },
        marge: {
          horizontaal: 10,
          verticaal: 1,
        },
        tussenruimte: {
          horizontaal: 0,
          verticaal: 0,
        },
      },
      sjablonen: [],
      menuItems: [],
    };
  },
  created() {
    this.getSjablonen();

    window.setInterval(
      function () {
        if (this.changes && !this.saved) {
          this.$store.commit("setEtiketSjabloon", this.sjabloon);
          this.saved = true;
        }
      }.bind(this),
      120000
    );

    RestService.getKolomType().then((res) => {
      res.data.kolommen.forEach((kolom) => {
        if (!kolom.verouderd) {
          this.kolommen.push(kolom);
        }
      });
    });

    if (
      this.$store.getters.geselecteerdeLeden &&
      this.$store.getters.geselecteerdeLeden.length > 0
    ) {
      this.sorteerLeden = true;
      this.$store.getters.geselecteerdeLeden.forEach((lid) => {
        this.geselecteerdeLeden.push(lid);
        this.leden.push({
          voornaam:
            lid.waarden["be.vvksm.groepsadmin.model.column.VoornaamColumn"],
          achternaam:
            lid.waarden["be.vvksm.groepsadmin.model.column.AchternaamColumn"],
          volledigenaam:
            lid.waarden[
              "be.vvksm.groepsadmin.model.column.VolledigeNaamColumn"
              ],
        });
      });
      this.sorteerLeden = false;
    } else {
      this.getLeden();
    }
  },

  watch: {
    sjabloon: {
      handler: function (oldValue, newValue) {
        if (newValue.naam) {
          this.changes = true;
          this.sjabloonIsValid();
          this.saved = false;
        }
      },
      deep: true,
    },
  },

  computed: {
    groepenLaden() {
      return this.$store.getters.groepenLaden;
    },

    groepen() {
      return this.$store.getters.groepen;
    },
    getOptions() {
      return {
        selector: 'textarea',
        images_file_types: 'jpg,svg,webp,png,bmp,jpeg',
        plugins: [
          "advlist autolink lists link image charmap print preview hr anchor pagebreak",
          "searchreplace wordcount visualblocks visualchars code fullscreen",
          "insertdatetime media nonbreaking save table contextmenu",
          "template paste textcolor colorpicker textpattern imagetools codesample fullscreen",
        ],
        height: 500,
        menubar: false,
        toolbar:
          "undo redo | bold italic underline strikethrough | fontselect |forecolor backcolor | bullist numlist | alignleft aligncenter alignright | table | code | customDrpdwn | image | preview | fullscreen",
        relative_urls: false,
        branding: false,
        remove_script_host: true,
        document_base_url: "https://groepsadmin.scoutsengidsenvlaanderen.be",
        setup: function (editor) {
          editor.ui.registry.addMenuButton("customDrpdwn", {
            text: "Veld invoegen",
            fetch: function (callback) {
              let kolommen = store.getters.kolommen;
              let items = [];
              kolommen.forEach((kolom) => {
                let item = {};
                if (!kolom.verouderd) {
                  item.text = kolom.label;
                  item.type = "menuitem";
                  item.onAction = function () {
                    editor.insertContent("[" + kolom.label + "]");
                  };
                  items.push(item);
                }
              });
              callback(items);
            },
          });
        },
      };
    },
    aantalLedenGeladen() {
      return this.leden.length;
    },
  },

  methods: {
    getSjablonen() {
      this.laden = true;
      RestService.getSjablonen("etiket")
        .then((res) => {
          this.sjablonen = [];
          res.data.sjablonen.forEach((sjabloon) => {
            this.sjablonen.push({label: sjabloon.naam, value: sjabloon});
          });
          this.getOpgeslagenEtiketSjabloon();
        })
        .catch((error) => {
          this.error = true;
          this.$toast.add({
            severity: "error",
            summary: "Wijzigingen",
            detail: error,
            life: 8000,
          });
        }).finally(() => {
        this.setStandaardSjabloon();
        this.laden = false;
      });
    },
    sluitInfodialog() {
      this.openEtikettenFoto = false;
    },

    toonLeden() {
      this.openOntvangerDialog = true;
    },

    getKolommen() {
      return this.kolommen;
    },
    openSjabloonModel() {
      this.openModal = !this.openModal;
    },
    opslaan(naam, value) {
      this.sjabloonIsValid();
      if (!this.error) {
        if (value && value.value.id) {
          this.sjabloon.id = value.value.id;
          this.sjabloon.naam = naam;
          this.laden = true;
          RestService.updateSjabloon("etiket", this.sjabloon.id, this.sjabloon)
            .then((res) => {
              this.sjabloon = res.data;
              this.$toast.add({
                severity: "success",
                summary: "Wijzigingen",
                detail: "Sjabloon opgeslagen",
                life: 3000,
              });
            }).catch((error) => {
            this.error = true;
            this.$toast.add({
              severity: "error",
              summary: "Wijzigingen",
              detail: error.message,
              life: 8000,
            });
          }).finally(() => {
            this.changes = false;
            this.laden = false;
            this.$store.commit("setEtiketSjabloon", null);
            this.getSjablonen();
          });
        } else {
          this.sjabloon.naam = naam;
          this.changes = true;
          this.sjabloon.id = null;
          this.laden = true;
          RestService.saveEtiketSjabloon(this.sjabloon)
            .then((res) => {
              this.sjabloon = res.data;
              this.$toast.add({
                severity: "success",
                summary: "Wijzigingen",
                detail: "Sjabloon opgeslagen",
                life: 3000,
              });
            }).catch((error) => {
            this.error = true;
            this.$toast.add({
              severity: "error",
              summary: "Wijzigingen",
              detail: error.message,
              life: 8000,
            });
          }).finally(() => {
            this.changes = false;
            this.laden = false;
            this.$store.commit("setEtiketSjabloon", null);
            this.getSjablonen();
          });
        }
      }
      this.closeModal();
    },
    remove() {
      this.$confirm.require({
        message:
          "Ben je zeker dat je sjabloon: " +
          this.sjabloon.naam +
          " wil verwijderen?",
        header: "Sjabloon verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          if (!this.sjabloon.id) {
            this.verwijderStoredSjabloon(this.sjabloon.naam)
          } else {
            RestService.verwijderSjabloon("etiket", this.sjabloon.id)
              .then(() => {
                this.sjablonen.forEach((listSjabloon, index) => {
                  if (listSjabloon.label === this.sjabloon.naam) {
                    this.sjablonen.splice(index, 1);
                  }
                });
                this.$toast.add({
                  severity: "success",
                  summary: "Sjabloon",
                  detail: "Sjabloon verwijderd.",
                  life: 3000,
                });
                this.setStandaardSjabloon("verwijderd");
              }).catch((error) => {
              this.error = true;
              this.$toast.add({
                severity: "error",
                summary: "Wijzigingen",
                detail: error,
                life: 8000,
              });
            });
          }
        },
        reject: () => {
          this.$confirm.close();
        },
      });

    },
    print() {
      this.filterLeden();
      let payload = {
        grootte: {
          horizontaal: parseInt(this.sjabloon.grootte.horizontaal),
          verticaal: parseInt(this.sjabloon.grootte.verticaal),
        },
        tussenruimte: {
          horizontaal: parseInt(this.sjabloon.tussenruimte.horizontaal),
          verticaal: parseInt(this.sjabloon.tussenruimte.verticaal),
        },
        marge: {
          horizontaal: parseInt(this.sjabloon.marge.horizontaal),
          verticaal: parseInt(this.sjabloon.marge.verticaal),
        },
        inhoud: this.sjabloon.inhoud,
        blanco: this.sjabloon.blanco,
        familie: this.sjabloon.familie,
        alleAdressen: this.sjabloon.alleAdressen,
        lidIds: [],
      };

      this.geselecteerdeLeden.forEach((lid) => {
        payload.lidIds.push(lid.id);
      });

      this.changes = false;
      RestService.printEtiketten(0, payload)
        .then((res) => {
          let obj = {};
          obj.fileUrl = window.URL.createObjectURL(new Blob([res.data], {type: "application/pdf"}));
          obj.title = "etiketten.pdf";
          this.downloadFile(obj);
        }).catch((error) => {
        console.log(error);
      }).finally(() => {
        this.laden = false;
      });
    },

    downloadFile(obj) {
      var a = document.createElement("a");
      a.href = obj.fileUrl;
      a.download = obj.title;
      document.body.appendChild(a);
      a.click();
    },

    sjabloonIsValid() {
      this.errors = {};
      this.error = false;
      return true;
    },

    gesorteerdeSjablonen(sjablonen) {
      return sjablonen.sort(function (a, b) {
        if (a.value.naam.toLowerCase() < b.value.naam.toLowerCase()) {
          return -1;
        }
        if (a.value.naam.toLowerCase() > b.value.naam.toLowerCase()) {
          return 1;
        }
        return 0;
      })
    },

    filterLeden() {
      this.lidIds = new Set();
      this.geselecteerdeLeden.forEach((lid) => {
        this.lidIds.add(lid.id);
      });
    },

    openFoto() {
      this.openEtikettenFoto = true;
    },

    getOpgeslagenEtiketSjabloon() {
      let sjabloon = this.$store.getters.etiketSjabloon;
      if (sjabloon) {
        sjabloon.id = null;
        this.sjablonen.push({label: sjabloon.naam, value: sjabloon});
      }
    },

    verwijderStoredSjabloon(naam) {
      this.sjablonen.forEach((sjabloon, index) => {
        if (sjabloon.label === naam) {
          this.sjablonen.splice(index, 1)
        }
      })
      this.$store.commit("setEtiketSjabloon", null);
      this.sjabloon = this.sjablonen[0].value;
      this.$toast.add({
        severity: "success",
        summary: "Sjabloon",
        detail: "Sjabloon verwijderd.",
        life: 3000,
      });
    },

    myUploader(event) {
      console.log(event);
    },
    closeModal() {
      this.openModal = false;
    },

    setStandaardSjabloon() {
        let geselecteerdeIndex = 0;
        this.gesorteerdeSjablonen(this.sjablonen).forEach((sjabloon, index) => {
          if (sjabloon && sjabloon.value.naam === this.sjabloon.naam) {
            geselecteerdeIndex = index;
          }
        })
        this.sjabloon = this.gesorteerdeSjablonen(this.sjablonen)[geselecteerdeIndex].value;
    },

    getLeden() {
      this.isLoadingLeden = true;
      RestService.getLeden(this.offset)
        .then((res) => {
          this.totaalAantalLeden = res.data.totaal;
          res.data.leden.forEach((lid) => {
            this.leden.push({
              voornaam:
                lid.waarden["be.vvksm.groepsadmin.model.column.VoornaamColumn"],
              achternaam:
                lid.waarden[
                  "be.vvksm.groepsadmin.model.column.AchternaamColumn"
                  ],
              volledigenaam:
                lid.waarden[
                  "be.vvksm.groepsadmin.model.column.VolledigeNaamColumn"
                  ],
            });
          });
          this.offset = this.leden.length;
          this.filterLeden();
          if (this.totaalAantalLeden > this.leden.length) {
            this.offset += 50;
            this.getLeden();
          }
        })
        .catch((error) => {
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
        });
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
          this.$store.commit("setEtiketSjabloon", this.sjabloon);
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

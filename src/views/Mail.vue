<template>
  <div>
    <SideMenu/>
    <ConfirmDialog/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div class="lg:ml-8">
      <Loader :show-loader="laden"></Loader>
      <div class="overflow-hidden lg:ml-6 p-2">
        <div>
          <save-template-dialog
            :open="openModal"
            :sjablonen="sjablonen"
            @closeModal="closeModal"
            @opslaan="opslaan"
          ></save-template-dialog>
        </div>
        <h4
          class="text-align-left mt-5 pl-lg-2-5em custom-title font-weight-bold"
        >
          E-mail
        </h4>
        <div class="row">
          <div class="col-12 col-lg-4">
            <div class="pl-lg-4em mt-2">
              <div class="d-flex justify-content-start">
                <label>Opgeslagen sjablonen:</label>
              </div>
              <div class="d-flex justify-content-start">
                <div>
                  <dropdown
                    :options="gesorteerdeSjablonen(sjablonen)"
                    v-model="sjabloon"
                    optionLabel="label"
                    optionValue="value"
                    class="sjabloon-mail-dropdown"
                  >
                  </dropdown>
                </div>
                <div class="ml-2 text-align-left"
                     v-if="sjabloon && (sjabloon.naam !== 'blanco sjabloon' || sjabloon.links.length !== 0)">
                  <Button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-alert mr-2 position-sticky verwijder-button"
                    title="Verwijder huidig sjabloon"
                    @click="remove"
                  />
                </div>
              </div>
              <div class="d-flex justify-content-start">
                <label>Van:</label>
              </div>
              <BaseInput
                v-model="sjabloon.van"
                :invalid="errors['van']"
                error-message="Dit veld is verplicht"
              ></BaseInput>
              <div class="d-flex justify-content-start">
                <label>Antwoorden naar:</label>
              </div>
              <BaseInput
                v-model="sjabloon.replyTo"
              ></BaseInput>
              <div class="d-flex justify-content-start">
                <label>Bcc:</label>
              </div>
              <BaseInput
                v-model="sjabloon.bcc">
              </BaseInput>
              <div class="row">
                <div class="text-align-left">
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
                <div class="col-lg-12 text-align-left">
                  <checkbox :binary=true v-model="sjabloon.bestemming.lid" id="alleLeden" class="mt--3p"></checkbox>
                  <label class="mt-1 ml-3" for="alleLeden">Stuur naar leden</label>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-12 text-align-left">
                  <checkbox :binary=true v-model="sjabloon.bestemming.contacten" id="alleContacten"
                            class="mt--3p"></checkbox>
                  <label class="mt-1 ml-3" for="alleContacten">Stuur naar de contacten van leden</label>
                </div>
              </div>
              <div class="row mb-3">
                <label class="col-4 text-align-left mt-1"
                >Bijlage (max. 5MB)
                  <a
                    href="https://wiki.scoutsengidsenvlaanderen.be/doku.php?id=handleidingen:groepsadmin:paginas:email_ledenlijst#e-mail_verzonden"
                    target="_blank"
                    class="help-button-wrapper ml-2 mt-0"
                  >
                    <i
                      class="fa fa-question-circle resolve help-button mt-0"
                      title="meer info"
                    ></i>
                  </a>
                </label>
                <FileUpload
                  name="bijlages[]"
                  :customUpload="true"
                  @select="selectFiles"
                  :multiple="true"
                  :maxFileSize="4999999"
                  previewWidth="50"
                  chooseLabel="Bestanden kiezen"
                  :showUploadButton="false"
                  :showCancelButton="false"
                  class="d-flex justify-content-start md:w-4 lg:w-6 sm:max-w-full"
                ></FileUpload>
                <div v-for="(file, index) in files" :key="index" class="text-align-left">
                  <div class="d-flex justify-content-start">
                    <div class="cut-off-text bestandsnaam">{{ file.name }}</div>
                    <Button
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-text p-button-danger mt--05"
                      @click="
                                    $event.stopPropagation();
                                    removeFile(index);
                                  "
                      title="Verwijder bestand"
                    />
                  </div>
                </div>
                <div class="col-lg-8">
                  <div class="d-flex justify-content-start">
                    <Button
                      icon="pi pi-save"
                      class="p-button-rounded p-button-warning float-right mr-2 position-sticky save-button ml-2"
                      title="Bewaar huidig sjabloon"
                      @click="openSjabloonModel"
                    />
                    <Button
                      icon="far fa-paper-plane"
                      title="Verstuur e-mail"
                      class="p-button-rounded p-button-warning float-right mr-2 position-sticky send-button ml-2"
                      @click="send"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-8 pl-lg-5em mt-2">
            <div class="d-flex justify-content-start ">
              <label>Onderwerp:</label>
            </div>
            <BaseInput
              v-model="sjabloon.onderwerp"
              :invalid="errors['onderwerp']"
              error-message="Dit veld is verplicht"
            ></BaseInput>
            <div class="row">
              <div class="col-12 pr-lg-5em">
                <Editor
                  :init="getOptions"
                  api-key="1o4al3jtztab1wf2880j7iio0hww1b4c6ut5qjqan57p3j4f"
                  v-model="sjabloon.inhoud"
                ></Editor>
              </div>
            </div>
          </div>
          <div>
            <Dialog
              header="Ontvangers"
              v-model:visible="openOntvangerDialog"
              :style="{ width: '25vw', 'max-height': '35vw' }"
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
          <div>
            <confirm
              :dialog-visible="confirmationDialog"
              :message="buildMessage()"
              @confirm="bevestigMail"
              @cancel="cancelMail"
              class="confirm-dialog"
            >
            </confirm>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer/>
</template>

<script>
import RestService from "@/services/api/RestService";
import Editor from "@tinymce/tinymce-vue";
import store from "../store";
import BaseInput from "@/components/input/BaseInput";
import FileUpload from "primevue/fileupload";
import SaveTemplateDialog from "@/components/mail/SaveTemplateDialog";
import Dialog from "primevue/dialog";
import confirm from "@/components/dialog/ConfirmDialog";
import Loader from "@/components/global/Loader";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import Footer from "@/components/global/Footer";
import ConfirmDialog from 'primevue/confirmdialog';


export default {
  name: "Mail",
  components: {
    Footer,
    BaseInput,
    Editor,
    FileUpload,
    SaveTemplateDialog,
    Dialog,
    ConfirmDialog,
    Loader,
    SideMenu,
    IngelogdLid,
    confirm
  },
  data() {
    return {
      kolommenLaden: false,
      bevestig: false,
      sorteerLeden: false,
      mailVersturen: false,
      watchable: false,
      isLoadingLeden: false,
      confirmationDialog: false,
      lidIds: new Set(),
      offset: 0,
      totaalAantalLeden: 0,
      openOntvangerDialog: false,
      openModal: false,
      error: false,
      errors: [],
      changes: false,
      saved: false,
      kolommen: [],
      files: [],
      geselecteerdeLeden: [],
      leden: [],
      sjabloon: {
        naam: "",
        lidIds: [],
        onderwerp: "",
        inhoud: "",
        bestemming: {
          lid: false,
          contacten: false,
          groepseigenGegevens: [],
        },
        van: "",
        replyTo: "",
        bcc: "",
      },
      defaultSjabloon: {
        naam: "",
        lidIds: [],
        onderwerp: "",
        inhoud: "",
        bestemming: {
          lid: false,
          contacten: false,
          groepseigenGegevens: [],
        },
        van: "",
        replyTo: "",
        bcc: "",
      },
      sjablonen: [],
      menuItems: [],
      feedback: {
        boodschap: "",
        infoLink: "",
        vraag: "",
      },
    };
  },
  created() {
    this.getSjablonen("creating");

    setTimeout(() => {
      this.watchable = true
    }, 2000)

    window.setInterval(
      function () {
        if (this.changes && !this.saved) {
          this.$store.commit("setMailSjabloon", this.sjabloon);
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
      this.isLoadingLeden = true;
      this.$store.getters.geselecteerdeLeden.forEach((lid) => {
        this.geselecteerdeLeden.push(lid);
        if (lid.waarden) {


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
        } else {
          this.leden.push({
            voornaam: lid.vgagegevens.voornaam,
            achternaam: lid.vgagegevens.achternaam,
            volledigenaam: lid.vgagegevens.voornaam + " " + lid.vgagegevens.achternaam
          })
        }
      });
      this.filterLeden();
      this.isLoadingLeden = false;
    } else {
      this.getLeden();
    }
  },

  watch: {
    sjabloon: {
      handler: function (oldValue, newValue) {
        if ((newValue.naam === oldValue.naam) && this.watchable) {
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
  },

  methods: {
    removeFile(index) {
      this.files.splice(index, 1);
    },

    getSjablonen(lifecycle) {
      RestService.getSjablonen("mail")
        .then((res) => {
          this.sjablonen = [];
          res.data.sjablonen.forEach((sjabloon) => {
            this.sjablonen.push({label: sjabloon.naam, value: sjabloon});
            if (
              sjabloon.naam.indexOf("blanco") > -1 &&
              lifecycle === "creating"
            ) {
              this.sjabloon = sjabloon;
            }
          });
          this.getOpgeslagenMailSjabloon();
        })
        .catch((error) => {
          this.error = true;
          this.$toast.add({
            severity: "error",
            summary: "Wijzigingen",
            detail: error,
            life: 8000,
          });
        });
    },

    selecteerSjabloon(sjabloon) {
      this.sjabloon = sjabloon;
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
        this.laden = true;
        if (value && value.value.id) {
          this.sjabloon.id = value.value.id;
          this.sjabloon.naam = naam;
          RestService.updateSjabloon("mail", this.sjabloon.id, this.sjabloon)
            .then((res) => {
              this.getSjablonen("update");
              this.sjabloon = res.data;
              this.$toast.add({
                severity: "success",
                summary: "Wijzigingen",
                detail: "Sjabloon opgeslagen",
                life: 3000,
              });
            })
            .catch((error) => {
              this.error = true;
              this.$toast.add({
                severity: "error",
                summary: "Wijzigingen",
                detail: error,
                life: 8000,
              });
              console.log(error);
            })
            .finally(() => {
              this.laden = false;
              this.changes = false;
              this.$store.commit("setMailSjabloon", null);
            });
        } else {
          this.sjabloon.naam = naam;
          RestService.saveSjabloon("mail", this.sjabloon)
            .then((res) => {
              this.getSjablonen("save");
              this.sjabloon = res.data;
              this.$toast.add({
                severity: "success",
                summary: "Wijzigingen",
                detail: "Sjabloon opgeslagen",
                life: 3000,
              });
            })
            .catch((error) => {
              console.log(error);
              this.error = true;
              this.$toast.add({
                severity: "error",
                summary: "Wijzigingen",
                detail: error,
                life: 8000,
              });
            })
            .finally(() => {
              this.changes = false;
              this.laden = false;
              this.$store.commit("setMailSjabloon", null);
            });
        }
      }
      this.closeModal();
    },

    filterLeden() {
      this.lidIds = new Set();
      this.geselecteerdeLeden.forEach((lid) => {
        this.lidIds.add(lid.id);
      });
    },

    getLeden() {
      this.isLoadingLeden = true;
      RestService.getLeden(this.offset)
        .then((res) => {
          this.totaalAantalLeden = res.data.totaal;
          res.data.leden.forEach((lid) => {
            this.geselecteerdeLeden.push(lid);
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
          if (this.totaalAantalLeden > this.leden.length) {
            this.offset = this.leden.length;
            this.getLeden();
          }
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
        });
    },

    remove(sjabloon) {
      this.$confirm.require({
        message:
          "Ben je zeker dat je sjabloon: " +
          sjabloon.naam +
          " wil verwijderen?",
        header: "Sjabloon verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          RestService.verwijderSjabloon("mail", this.sjabloon.id)
            .then(() => {
              this.setStandaardSjabloon();
              this.sjablonen.forEach((listSjabloon, index) => {
                if (listSjabloon.label === sjabloon.naam) {
                  this.sjablonen.splice(index, 1);
                }
              });
              this.$toast.add({
                severity: "success",
                summary: "Sjabloon",
                detail: "Sjabloon verwijderd.",
                life: 3000,
              });
            })
            .catch((error) => {
              this.error = true;
              this.$toast.add({
                severity: "error",
                summary: "Wijzigingen",
                detail: error,
                life: 8000,
              });
            });
        },
        reject: () => {
          this.$confirm.close();
        },
      });
    },

    buildMessage() {
      return (
        this.feedback.boodschap +
        "<br/>" +
        this.feedback.vraag +
        "<br/>" +
        '<a class="cursor-pointer custom-title mt-4" href=' +
        this.feedback.infoLink +
        ' target="_blank">Meer info...</a> '
      );
    },

    openDialog() {
      this.confirmationDialog = true;
    },

    send() {
      this.filterLeden();
      this.sendMail();
    },

    bevestigMail() {
      this.bevestig = true;
      this.sendMail();
      this.confirmationDialog = false;
    },

    gesorteerdeSjablonen(sjablonen) {
      return sjablonen.sort(function (a, b) {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      })
    },

    sendMail() {
      // We hebben enkel de ID's nodig om door te sturen naar de api

      var sjabloonObj = {
        bcc: this.sjabloon.bcc,
        replyTo: this.sjabloon.replyTo,
        inhoud: this.sjabloon.inhoud,
        onderwerp: this.sjabloon.onderwerp,
        van: this.sjabloon.van,
        bestemming: {
          lid: this.sjabloon.bestemming.lid,
          contacten: this.sjabloon.bestemming.contacten,
          groepseigenGegevens: [],
        },
        lidIds: [],
      };

      this.lidIds.forEach((id) => {
        sjabloonObj.lidIds.push(id);
      });

      var formData = new FormData();
      // bijlages toevoegen aan multipart/form-data
      this.files.forEach(function (file) {
        formData.append("attachments", file);
      });

      var sjabloon = new Blob([JSON.stringify(sjabloonObj)], {
        type: "application/json",
      });

      // sjabloon toevoegen aan multipart/form-data
      formData.append("sjabloon", sjabloon);

      this.mailVersturen = true;
      RestService.verstuurMail(this.bevestig, formData)
        .then((res) => {
          this.changes = false;
          this.bevestig = false;
          // todo dialog met resultaat
          console.log("mail was sent TO list", res);
        })
        .catch((error) => {
          this.feedback.boodschap = error.response.data.boodschap;
          this.feedback.vraag = error.response.data.vraag;
          this.feedback.infoLink = error.response.data.infoLink;
          this.openDialog();
        });
    },

    cancelMail() {
      this.confirmationDialog = false;
    },

    toonLeden() {
      this.openOntvangerDialog = true;
    },

    sjabloonIsValid() {
      this.errors = {};
      this.error = false;
      if (!this.sjabloon.van) {
        this.errors["van"] = "required";
        this.error = true;
      }
      if (!this.sjabloon.onderwerp) {
        this.errors["onderwerp"] = "required";
        this.error = true;
      }
    },

    getOpgeslagenMailSjabloon() {
      let sjabloon = this.$store.getters.mailSjabloon;
      if (sjabloon) {
        this.sjablonen.push({label: sjabloon.naam, value: sjabloon});
      }
    },

    selectFiles(event) {
      this.files = event.files;
      console.log(this.files.length)
    },

    closeModal() {
      this.openModal = false;
    },

    setStandaardSjabloon() {
      this.sjablonen.forEach((sjabloon) => {
        if (sjabloon.label.indexOf("blanco") > -1) {
          this.sjabloon = sjabloon.value;
        }
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
          this.$store.commit("setMailSjabloon", this.sjabloon);
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

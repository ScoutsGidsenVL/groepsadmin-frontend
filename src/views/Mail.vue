<template>
  <div>
    <indicator :action-text="indicator.actionText" :is-loading="indicator.isLoading"
               :use-slot="indicator.useSlot"></indicator>
    <div class="overflow-hidden">
      <div>
        <save-template-dialog :open="openModal" :sjablonen="sjablonen" @closeModal="closeModal"
                              @opslaan="opslaan"></save-template-dialog>
      </div>
      <h4 class="text-align-left mt-5 pl-lg-2-5em custom-title font-weight-bold">E-mail</h4>
      <div class="pl-lg-4em mt-2">
        <div class="row">
          <div class="col-lg-6 text-align-left mb-5">
            <BaseDropdown v-model="sjabloon" :options="sjablonen" label="Opgeslagen sjabloon kiezen"
                          @changeValue="selecteerSjabloon"></BaseDropdown>
          </div>
          <Button icon="pi pi-trash"
                  class="p-button-rounded p-button-alert float-right mr-2 position-sticky delete-button"
                  title="Verwijder huidig sjabloon"
                  v-show="!( sjabloon.naam.indexOf('blanco') > -1 || ( sjabloon.links && sjabloon.links.length === 0 ))"
                  @click="remove(sjabloon)"/>
        </div>
        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Van" v-model="sjabloon.van" :invalid="errors['van']"
                       error-message="Dit veld is verplicht"></BaseInput>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Antwoorden naar" v-model="sjabloon.replyTo"></BaseInput>
          </div>
        </div>

        <div class="row">
          <div class="col-sm-2 text-align-left">
            <label>Ontvangers</label>
          </div>
          <div class="col-lg-8 text-align-left">
            <BaseCheckboxLeft label="Stuur naar leden" v-model="sjabloon.bestemming.lid"></BaseCheckboxLeft>
          </div>
        </div>
        <div class="row">
          <div class="offset-sm-2"></div>
          <div class="col-lg-8 text-align-left">
            <BaseCheckboxLeft label="Stuur naar de contacten van leden"
                              v-model="sjabloon.bestemming.contacten"></BaseCheckboxLeft>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Bcc" v-model="sjabloon.bcc"></BaseInput>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6 text-align-left mt-5">
            <BaseInput label="Onderwerp" v-model="sjabloon.onderwerp" :invalid="errors['onderwerp']"
                       error-message="Dit veld is verplicht"></BaseInput>
          </div>
        </div>
      </div>
      <div class="row ml-5 mb-3">
        <label class="col-lg-2 text-align-left mt-1">Bijlage (max. 5MB)
          <a
            href="https://wiki.scoutsengidsenvlaanderen.be/doku.php?id=handleidingen:groepsadmin:paginas:email_ledenlijst#e-mail_verzonden"
            target="_blank" class="help-button-wrapper ml-2 mt-0">
            <i class="fa fa-question-circle resolve help-button mt-0" title="meer info"></i>
          </a>
        </label>
        <FileUpload
          name="bijlages[]"
          mode="basic" :customUpload="true"
          @uploader="myUploader" :multiple="true"
          :maxFileSize="4999999"
          chooseLabel="Kies bestand"
          invalidFileSizeMessage="Bestandsgrootte mag niet groter zijn dan 5MB"
          class="ml-3 mr-lg-9"/>
        <div class="col-lg-8">
          <div class="d-flex justify-content-end">
            <Button icon="pi pi-save"
                    class="p-button-rounded p-button-warning float-right mr-2 position-sticky save-button ml-2"
                    title="Bewaar huidig sjabloon"
                    @click="openSjabloonModel"/>
            <Button icon="far fa-paper-plane"
                    title="Verstuur e-mail"
                    class="p-button-rounded p-button-warning float-right mr-2 position-sticky send-button ml-2"
                    @click="send"/>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 pl-lg-5em pr-lg-5em ">
          <Editor :init="getOptions" api-key="1o4al3jtztab1wf2880j7iio0hww1b4c6ut5qjqan57p3j4f"
                  v-model="sjabloon.inhoud"></Editor>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RestService from "@/services/api/RestService";
import BaseDropdown from "@/components/input/BaseDropdown";
import Editor from '@tinymce/tinymce-vue';
import store from "../store";
import BaseInput from "@/components/input/BaseInput";
import BaseCheckboxLeft from "@/components/input/BaseCheckboxLeft";
import FileUpload from "primevue/fileupload";
import SaveTemplateDialog from "@/components/mail/SaveTemplateDialog";
import Indicator from "@/components/global/Indicator";


export default {
  name: "Mail",
  components: {
    BaseCheckboxLeft,
    BaseInput,
    BaseDropdown,
    Editor,
    FileUpload,
    SaveTemplateDialog,
    Indicator
  },
  data() {
    return {
      kolommenLaden: false,
      openModal: false,
      error: false,
      errors: [],
      changes: false,
      kolommen: [],
      sjabloon: {
        naam: '',
        lidIds: [],
        onderwerp: '',
        inhoud: '',
        bestemming: {
          lid: false,
          contacten: false,
          groepseigenGegevens: []
        },
        van: '',
        replyTo: '',
        bcc: '',
      },
      defaultSjabloon: {
        naam: '',
        lidIds: [],
        onderwerp: '',
        inhoud: '',
        bestemming: {
          lid: false,
          contacten: false,
          groepseigenGegevens: []
        },
        van: '',
        replyTo: '',
        bcc: '',
      },
      sjablonen: [],
      menuItems: [],
      indicator: {
        isLoading: false,
        canCancel: false,
        fullPage: true,
        useSlot: false,
        actionText: '',
      },
    }
  },
  created() {
    this.getSjablonen('creating');

    window.setInterval(function(){
      if (this.changes){
        this.$store.commit('setMailSjabloon', this.sjabloon);
      }
    }.bind(this),120000);

    RestService.getKolomType()
      .then(res => {
        res.data.kolommen.forEach((kolom) => {
          if (!kolom.verouderd) {
            this.kolommen.push(kolom);
          }
        })
      })
  },

  watch: {
    'sjabloon': {
      handler: function (oldValue, newValue) {
        if (newValue.naam) {
          this.changes = true;
          this.sjabloonIsValid();
        }
      },
      deep: true
    }
  },

  computed: {
    groepenLaden() {
      return this.$store.getters.groepenLaden
    },

    groepen() {
      return this.$store.getters.groepen
    },
    getOptions() {
      return {
        plugins: [
          'advlist autolink lists link image charmap print preview hr anchor pagebreak',
          'searchreplace wordcount visualblocks visualchars code fullscreen',
          'insertdatetime media nonbreaking save table contextmenu',
          'template paste textcolor colorpicker textpattern imagetools codesample fullscreen'
        ],
        height: 500,
        menubar: false,
        toolbar: 'undo redo | bold italic underline strikethrough | fontselect |forecolor backcolor | bullist numlist | alignleft aligncenter alignright | table | code | customDrpdwn | media | preview | fullscreen',
        relative_urls: false,
        branding: false,
        remove_script_host: true,
        document_base_url: "https://groepsadmin.scoutsengidsenvlaanderen.be",
        setup: function (editor) {
          editor.ui.registry.addMenuButton('customDrpdwn', {
            text: 'Veld invoegen',
            fetch: function (callback) {
              let kolommen = store.getters.kolommen;
              let items = [];
              kolommen.forEach((kolom) => {
                let item = {};
                if (!kolom.verouderd) {
                  item.text = kolom.label;
                  item.type = 'menuitem';
                  item.onAction = function () {
                    editor.insertContent('[' + kolom.label + ']');
                  }
                  items.push(item);
                }
              })
              callback(items);
            }
          })

        }
      }
    }
  },

  methods: {
    getSjablonen(lifecycle) {
      RestService.getMailSjablonen()
        .then(res => {
          this.sjablonen = [];
          res.data.sjablonen.forEach((sjabloon) => {
            this.sjablonen.push({label: sjabloon.naam, value: sjabloon});
              if (sjabloon.naam.indexOf('blanco') > -1 && lifecycle === 'creating') {
                this.sjabloon = sjabloon;
              }
          });
          this.getOpgeslagenMailSjabloon();
        })
    },

    selecteerSjabloon(sjabloon) {
      this.sjabloon = sjabloon
    },
    getKolommen() {
      return this.kolommen;
    },
    openSjabloonModel() {
      this.openModal = !this.openModal;
    },
    opslaan(naam, value) {
      this.sjabloonIsValid();
      this.indicator.isLoading = true;
      if (!this.error) {
        if (value && value.value.id) {
          this.sjabloon.id = value.value.id;
          this.sjabloon.naam = naam;
          RestService.updateSjabloon(this.sjabloon.id, this.sjabloon)
            .then(res => {
              this.getSjablonen('update');
              this.sjabloon = res.data;
              this.$toast.add({
                severity: 'success',
                summary: 'Wijzigingen',
                detail: 'Sjabloon opgeslagen',
                life: 3000
              });
            })
            .catch(error => {
              this.error = true;
              this.$toast.add({
                severity: 'error',
                summary: 'Wijzigingen',
                detail: 'Er is iets misgegaan bij het opslaan',
                life: 3000
              })
              console.log(error);
            })
            .finally(() => {
              this.changes = false;
              this.indicator.isLoading = false;
              this.$store.commit('setMailSjabloon', null);
            })
        } else {
          this.sjabloon.naam = naam;
          RestService.saveSjabloon(this.sjabloon)
            .then(res => {
              this.getSjablonen('save');
              this.sjabloon = res.data;
              this.$toast.add({
                severity: 'success',
                summary: 'Wijzigingen',
                detail: 'Sjabloon opgeslagen',
                life: 3000
              });
            })
            .catch(error => {
              console.log(error);
              this.error = true;
              this.$toast.add({
                severity: 'error',
                summary: 'Wijzigingen',
                detail: 'Er is iets misgegaan bij het opslaan',
                life: 3000
              });
            })
          .finally(() => {
            this.changes = false;
            this.indicator.isLoading = false;
            this.$store.commit('setMailSjabloon', null);
          })
        }
      }
      this.closeModal();
    },
    remove(sjabloon) {
      this.$confirm.require({
        message: 'Ben je zeker dat je sjabloon: ' + sjabloon.naam + ' wil verwijderen?',
        header: 'Sjabloon verwijderen',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          RestService.verwijderSjabloon(this.sjabloon.id)
            .then(() => {
              this.setStandaardSjabloon();
              this.sjablonen.forEach((listSjabloon, index) => {
                if (listSjabloon.label === sjabloon.naam) {
                  this.sjablonen.splice(index, 1);
                }
              })
              this.$toast.add({
                severity: 'success',
                summary: 'Sjabloon',
                detail: 'Sjabloon verwijderd.',
                life: 3000
              });
            })
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    send() {
      //Todo na ledenlijst
    },

    sjabloonIsValid() {
      this.errors = {};
      this.error = false;
      if (!this.sjabloon.van) {
        this.errors['van'] = 'required';
        this.error = true;
      }
      if (!this.sjabloon.onderwerp) {
        this.errors['onderwerp'] = 'required';
        this.error = true;
      }
    },

    getOpgeslagenMailSjabloon() {
      let sjabloon = this.$store.getters.mailSjabloon;
      if (sjabloon){
        this.sjablonen.push({label: sjabloon.naam, value: sjabloon})
      }
    },

    myUploader(event) {
      console.log(event)
    },
    closeModal() {
      this.openModal = false;
    },
    setStandaardSjabloon() {
      this.sjablonen.forEach((sjabloon) => {
        if (sjabloon.label.indexOf('blanco') > -1) {
          this.sjabloon = sjabloon.value;
        }
      })
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.changes) {
      this.$confirm.require({
        message: 'Je hebt niet opgeslagen wijzigingen. Ben je zeker dat je wil doorgaan?',
        header: 'Wijzigingen',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          next();
        },
        reject: () => {
          next(false);
        }
      });
    } else {
      next()
    }
  }
}
</script>

<style scoped>

</style>
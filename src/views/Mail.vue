<template>
  <div class="overflow-hidden">
    <h4 class="text-align-left mt-5 padding-left-2-5em custom-title font-weight-bold">E-mail</h4>
    <div class="padding-left-4em mt-2">
      <div class="row">
        <div class="col-lg-6 text-align-left">
          <BaseDropdown v-model="sjabloon" :options="sjablonen" label="Opgeslagen sjabloon kiezen"
                        @changeValue="selecteerSjabloon"></BaseDropdown>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 text-align-left">
          <BaseInput label="Van" v-model="sjabloon.van"></BaseInput>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 text-align-left">
          <BaseInput label="Antwoorden naar" v-model="sjabloon.replyTo"></BaseInput>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 text-align-left">
          <BaseInput label="Bcc" v-model="sjabloon.bcc"></BaseInput>
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
      <div class="row mb-1">
        <div class="col-lg-6 text-align-left padding-top-2em">
          <BaseInput label="Onderwerp" v-model="sjabloon.onderwerp"></BaseInput>
        </div>
        <div class="col-lg-6">
          <div class="mt-4 d-flex justify-content-end padding-right-4em">
            <Button icon="pi pi-trash"
                    class="p-button-rounded p-button-alert float-right mr-2 position-sticky delete-button"
                    title="Verwijder huidig sjabloon"
                    v-show="!( sjabloon.naam.indexOf('blanco') > -1 || ( sjabloon.links && sjabloon.links.length === 0 ))"
                    @click="remove(sjabloon)"/>
            <Button icon="pi pi-save"
                    class="p-button-rounded p-button-warning float-right mr-2 position-sticky save-button ml-2"
                    title="Bewaar huidig sjabloon"
                    @click="save"/>
            <Button icon="far fa-paper-plane"
                    title="Verstuur e-mail"
                    class="p-button-rounded p-button-warning float-right mr-2 position-sticky send-button ml-2"
                    @click="send"/>
          </div>
        </div>
      </div>
    </div>
    <div class="row ml-5 mb-4">
      <label class="col-2 text-align-left mt-1">Bijlage (max. 5MB)
        <a href="https://wiki.scoutsengidsenvlaanderen.be/doku.php?id=handleidingen:groepsadmin:paginas:email_ledenlijst#e-mail_verzonden" target="_blank" class="help-button-wrapper ml-2 mt-0">
          <i class="fa fa-question-circle resolve help-button mt-0" title="meer info"></i>
        </a>
      </label>
      <FileUpload
        name="bijlages[]"
        mode="basic" :customUpload="true"
        @uploader="myUploader" :multiple="true"
        :maxFileSize="4999999"
        chooseLabel="Browse..."
        invalidFileSizeMessage="Bestandsgrootte mag niet groter zijn dan 5MB"
        class="ml-3"/>
    </div>
    <div class="row">
      <div class="col-12 padding-left-5em padding-right-5em ">
        <Editor :init="getOptions" api-key="1o4al3jtztab1wf2880j7iio0hww1b4c6ut5qjqan57p3j4f"
                v-model="sjabloon.inhoud"></Editor>
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

export default {
  name: "Mail",
  components: {
    BaseCheckboxLeft,
    BaseInput,
    BaseDropdown,
    Editor,
    FileUpload,
  },
  data() {
    return {
      kolommenLaden: false,
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
      sjablonen: [],
      menuItems: [],
    }
  },
  created() {
    RestService.getMailSjablonen()
      .then(res => {
        this.sjablonen = [];
        res.data.sjablonen.forEach((sjabloon) => {
          this.sjablonen.push({label: sjabloon.naam, value: sjabloon});
          if (sjabloon.naam.indexOf('blanco') > -1) {
            this.sjabloon = sjabloon;
          }
        });
      })

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
      handler: function () {
        console.log('template changed')
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
    selecteerSjabloon(sjabloon) {
      this.sjabloon = sjabloon
    },
    getKolommen() {
      return this.kolommen;
    },
    getMenuItems() {
      return
    },
    save() {

    },
    remove(sjabloon) {
      this.$confirm.require({
        message: 'Ben je zeker dat je sjabloon: ' + sjabloon.naam + ' wil verwijderen?',
        header: 'Sjabloon verwijderen',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.sjablonen.forEach((listSjabloon, index) => {
            console.log(sjabloon);
            if (listSjabloon.label === sjabloon.naam){
              this.setStandaardSjabloon();
              console.log(index);
              //this.sjablonen.splice(index, 1);
            }
          })

        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    send() {

    },
    myUploader(event) {
      console.log(event)
    },
    link(){
      console.log('clicked on link')
    },
    setStandaardSjabloon() {
      this.sjablonen.forEach((sjabloon) => {
        if (sjabloon.label.indexOf('blanco') > -1) {
          this.sjabloon = sjabloon;
        }
      })
    }
  },
}
</script>

<style scoped>

</style>
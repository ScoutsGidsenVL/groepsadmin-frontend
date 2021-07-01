<template>
  <div>
    <indicator :action-text="indicator.actionText" :is-loading="indicator.isLoading"
               :use-slot="indicator.useSlot"></indicator>
    <div class="overflow-hidden">
      <div>
        <save-template-dialog :open="openModal" :sjablonen="sjablonen" @closeModal="closeModal"
                              @opslaan="opslaan"></save-template-dialog>
      </div>
      <h4 class="text-align-left mt-5 pl-lg-2-5em custom-title font-weight-bold">Etiketten</h4>
      <div class="pl-lg-4em mt-2">
        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseDropdown v-model="sjabloon" :options="sjablonen" label="Opgeslagen sjablonen"
                          @changeValue="selecteerSjabloon"></BaseDropdown>
          </div>
          <Button icon="pi pi-trash"
                  class="p-button-rounded p-button-alert float-right mr-2 position-sticky delete-button"
                  title="Verwijder huidig sjabloon"
                  v-show="!( sjabloon.naam.indexOf('deelnamebewijs') > -1 || ( sjabloon.links && sjabloon.links.length === 0 ))"
                  @click="remove(sjabloon)"/>
        </div>
        <div class="row mt-1">
          <div class="col-sm-2 text-align-left">
            <label>Ontvangers: <span
              v-if="leden.length > 0"> {{ leden.length === 1 ? '1 lid' : leden.length + " leden" }}</span><span
              v-if="leden.length > 0" @click="toonLeden" class="clickable custom-title"> (details)</span>
              <span v-if="isLoadingLeden" class="mt-1">Leden ophalen &nbsp;<i class="fas fa-spinner fa-spin"></i></span>
            </label>
          </div>
          <div class="col-lg-8 text-align-left">
            <BaseCheckboxLeft label="Familie" v-model="sjabloon.familie"></BaseCheckboxLeft>
          </div>
        </div>
        <div class="row">
          <div class="offset-sm-2"></div>
          <div class="col-lg-3 text-align-left">
            <BaseCheckboxLeft label="Alle adressen"
                              v-model="sjabloon.alleAdressen"></BaseCheckboxLeft>
          </div>
          <div class="col-lg-7 pr-lg-5em">
            <div class="d-flex justify-content-end">
              <Button icon="pi pi-save"
                      class="p-button-rounded p-button-warning float-right mr-2 position-sticky save-button ml-2"
                      title="Bewaar huidig sjabloon"
                      @click="openSjabloonModel"/>
              <Button icon="far fa-print"
                      title="Print etiket"
                      class="p-button-rounded p-button-warning float-right mr-2 position-sticky send-button ml-2"
                      @click="print"/>
            </div>
          </div>
        </div>

      </div>
      <div class="row">
        <div class="col-12 pl-lg-5em pr-lg-5em mt-3">
          <Editor :init="getOptions" api-key="1o4al3jtztab1wf2880j7iio0hww1b4c6ut5qjqan57p3j4f"
                  v-model="sjabloon.inhoud"></Editor>
        </div>
      </div>
      <div class="pl-lg-4em mt-5">
        <h4 class="text-align-left mt-5 custom-title font-weight-bold">Etiket eigenschappen
          <span class="help-button-wrapper small clickable" @click="openFoto">&nbsp; (klik hier voor schema)</span></h4>
        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Grootte horizontaal" v-model="sjabloon.grootte.horizontaal" type="number"></BaseInput>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Grootte verticaal" v-model="sjabloon.grootte.horizontaal" type="number"></BaseInput>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Marge horizontaal" v-model="sjabloon.marge.horizontaal" type="number"></BaseInput>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Marge verticaal" v-model="sjabloon.marge.horizontaal" type="number"></BaseInput>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Tussenruimte horizontaal" v-model="sjabloon.tussenruimte.horizontaal"
                       type="number"></BaseInput>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Tussenruimte verticaal" v-model="sjabloon.tussenruimte.horizontaal"
                       type="number"></BaseInput>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6 text-align-left">
            <BaseInput label="Blanco etiketten" v-model="sjabloon.blanco" type="number"
                       help-link="https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:etiketten"></BaseInput>
          </div>
        </div>
      </div>
    </div>
    <div>
      <Dialog header="Ontvangers" v-model:visible="openOntvangerDialog" :style="{width: '50vw', height: '30vw'}"
              :modal="true">
        <div class="email-leden col-xs-12">
          <ul>
            <li v-for="(lid, index) in leden" :key=index>
              <span v-if="lid.voornaam"> &nbsp;{{ lid.voornaam }} </span>
              <span v-if="lid.achternaam">&nbsp;{{ lid.achternaam }}</span>
              <span v-if="!lid.voornaam && !lid.achternaam && lid.volledigenaam">&nbsp;{{ lid.volledigenaam }} </span>
              <span v-if="!lid.voornaam && !lid.achternaam && !lid.volledigenaam"> - geen naam beschikbaar - </span>
            </li>
          </ul>
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script>
import BaseCheckboxLeft from "@/components/input/BaseCheckboxLeft";
import BaseInput from "@/components/input/BaseInput";
import BaseDropdown from "@/components/input/BaseDropdown";
import Editor from "@tinymce/tinymce-vue";
import SaveTemplateDialog from "@/components/mail/SaveTemplateDialog";
import Indicator from "@/components/global/Indicator";
import RestService from "@/services/api/RestService";
import store from "@/store";
import Dialog from "primevue/dialog";


export default {
  name: "Etiketten",
  components: {
    BaseCheckboxLeft,
    BaseInput,
    BaseDropdown,
    Editor,
    SaveTemplateDialog,
    Indicator,
    Dialog
  },
  data() {
    return {
      changes: false,
      error: false,
      errors: [],
      geselecteerdeLeden: [],
      isLoadingLeden: false,
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
      sjabloon: {
        naam: '',
        lidIds: [],
        blanco: 0,
        inhoud: '',
        alleAdressen: false,
        familie: false,
        aantalEtikettenPerRij: 1,
        aantalRijenPerPagina: 1,
        grootte: {
          horizontaal: 195,
          verticaal: 287
        },
        marge: {
          horizontaal: 10,
          verticaal: 1
        },
        tussenruimte: {
          horizontaal: 0,
          verticaal: 0
        }
      },
      defaultSjabloon: {
        naam: '',
        lidIds: [],
        blanco: 0,
        inhoud: '',
        alleAdressen: false,
        familie: false,
        aantalEtikettenPerRij: 1,
        aantalRijenPerPagina: 1,
        grootte: {
          horizontaal: 195,
          verticaal: 287
        },
        marge: {
          horizontaal: 10,
          verticaal: 1
        },
        tussenruimte: {
          horizontaal: 0,
          verticaal: 0
        }
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
    this.getSjablonen();

    window.setInterval(function () {
      if (this.changes && !this.saved) {
        this.$store.commit('setEtiketSjabloon', this.sjabloon);
        this.saved = true;
      }
    }.bind(this), 120000);

    RestService.getKolomType()
      .then(res => {
        res.data.kolommen.forEach((kolom) => {
          if (!kolom.verouderd) {
            this.kolommen.push(kolom);
          }
        })
      })

    if (this.$store.getters.geselecteerdeLeden && this.$store.getters.geselecteerdeLeden.length > 0) {
      this.sorteerLeden = true;
      this.$store.getters.geselecteerdeLeden.forEach(lid => {
        this.geselecteerdeLeden.push(lid);
        this.leden.push({
          'voornaam': lid.waarden['be.vvksm.groepsadmin.model.column.VoornaamColumn'],
          'achternaam': lid.waarden['be.vvksm.groepsadmin.model.column.AchternaamColumn'],
          'volledigenaam': lid.waarden['be.vvksm.groepsadmin.model.column.VolledigeNaamColumn']
        })
      })
      this.sorteerLeden = false;
    } else {
      this.getLeden()
    }
  },

  watch: {
    'sjabloon': {
      handler: function (oldValue, newValue) {
        if (newValue.naam) {
          this.changes = true;
          this.sjabloonIsValid();
          this.saved = false;
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
    },
    aantalLedenGeladen() {
      return this.leden.length;
    },
  },

  methods: {
    getSjablonen() {
      RestService.getEtiketSjablonen()
        .then(res => {
          this.sjablonen = [];
          res.data.sjablonen.forEach((sjabloon) => {
            this.sjablonen.push({label: sjabloon.naam, value: sjabloon});
            this.sjabloon = this.sjablonen[0].value;
          });
          this.getOpgeslagenEtiketSjabloon();
        })
        .catch(error => {
          this.error = true;
          this.$toast.add({
            severity: 'error',
            summary: 'Wijzigingen',
            detail: error,
            life: 8000
          })
        })
    },

    toonLeden() {
      this.openOntvangerDialog = true;
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
          RestService.updateEtiketSjabloon(this.sjabloon.id, this.sjabloon)
            .then(res => {
              this.getSjablonen();
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
                detail: error.message,
                life: 8000
              })
            })
            .finally(() => {
              this.changes = false;
              this.indicator.isLoading = false;
              this.$store.commit('setEtiketSjabloon', null);
            })
        } else {
          this.sjabloon.naam = naam;
          RestService.saveEtiketSjabloon(this.sjabloon)
            .then(res => {
              this.getSjablonen();
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
                detail: error.message,
                life: 8000
              });
            })
            .finally(() => {
              this.changes = false;
              this.indicator.isLoading = false;
              this.$store.commit('setEtiketSjabloon', null);
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
          RestService.verwijderEtiketSjabloon(this.sjabloon.id)
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
            .catch(error => {
              this.error = true;
              this.$toast.add({
                severity: 'error',
                summary: 'Wijzigingen',
                detail: error,
                life: 8000
              });
            })
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    print() {
      this.filterLeden();
      let payload = {
        "grootte": {
          "horizontaal": parseInt(this.sjabloon.grootte.horizontaal),
          "verticaal": parseInt(this.sjabloon.grootte.verticaal)
        },
        "tussenruimte": {
          "horizontaal": parseInt(this.sjabloon.tussenruimte.horizontaal),
          "verticaal": parseInt(this.sjabloon.tussenruimte.verticaal)
        },
        "marge": {
          "horizontaal": parseInt(this.sjabloon.marge.horizontaal),
          "verticaal": parseInt(this.sjabloon.marge.verticaal)
        },
        "inhoud": this.sjabloon.inhoud,
        "blanco": this.sjabloon.blanco,
        "familie": this.sjabloon.familie,
        "alleAdressen": this.sjabloon.alleAdressen,
        "lidIds": []
      }

      this.geselecteerdeLeden.forEach(lid => {
        payload.lidIds.push(lid.id)
      })

      this.changes = false;
      RestService.printEtiketten(0, payload)
        .then(res => {
          let obj = {};
          let blob = new Blob([res.data], {type: 'application/pdf'});
          obj.fileUrl = window.URL.createObjectURL(blob);
          obj.title = 'etiketten.pdf';
          this.downloadFile(obj);
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.indicator.isLoading = false;
        })

    },

    downloadFile(obj) {
      var a = document.createElement('a');
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

    filterLeden() {
      this.lidIds = new Set();
      this.geselecteerdeLeden.forEach(lid => {
        this.lidIds.add(lid.id);
      })
    },

    openFoto() {
      this.openEtikettenFoto = true;
    },

    getOpgeslagenEtiketSjabloon() {
      let sjabloon = this.$store.getters.etiketSjabloon;
      if (sjabloon) {
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
    },

    getLeden() {
      this.isLoadingLeden = true;
      RestService.getLeden(this.offset)
        .then(res => {
          this.totaalAantalLeden = res.data.totaal;
          res.data.leden.forEach(lid => {
            this.leden.push({
              'voornaam': lid.waarden['be.vvksm.groepsadmin.model.column.VoornaamColumn'],
              'achternaam': lid.waarden['be.vvksm.groepsadmin.model.column.AchternaamColumn'],
              'volledigenaam': lid.waarden['be.vvksm.groepsadmin.model.column.VolledigeNaamColumn']
            })
          })
          this.offset = this.leden.length;
          this.filterLeden();
          if (this.totaalAantalLeden > this.leden.length) {
            this.offset += 50;
            this.getLeden();
          }
        })
        .catch(error => {
          console.log(error);
          this.error = true;
          this.$toast.add({
            severity: 'error',
            summary: 'Ophalen leden',
            detail: error.message,
            life: 8000
          })
        })
        .finally(() => {
          this.isLoadingLeden = false;
        })
    },


  },
  beforeRouteLeave(to, from, next) {
    if (this.changes) {
      this.$confirm.require({
        message: 'Je hebt niet opgeslagen wijzigingen. Ben je zeker dat je wil doorgaan?',
        header: 'Wijzigingen',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.$store.commit('setEtiketSjabloon', this.sjabloon);
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
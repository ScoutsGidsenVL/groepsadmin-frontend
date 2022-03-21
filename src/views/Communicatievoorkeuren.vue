<template>
  <div class="container-fluid md:w-90 lg:ml-6">
    <MessageDialog message="Kijk je e-mailadres na in je profielpagina, zo mis je zeker geen enkel nummer"
                   :dialog-visible="messageDialog" @close="sluiten"></MessageDialog>
    <div class="hidden lg:block lg:ml-8">
      <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4"/>
    </div>
    <Loader
      :showLoader="laden || saving"
    ></Loader>
    <div class="lg:ml-8 d-flex justify-content-start">
      <div class="row ml20">
        <div class="col-sm-12 col-md-8 mt-8 col-lg-8 ml-4 text-align-left">
          <p>Scouts en Gidsen Vlaanderen wil met haar tijdschriften leiding en leden inspireren en informeren over
            scouting.
            Deze tijdschriften krijg je standaard in jouw brievenbus en groeien met jou mee: Krak?Boem! voor de leden,
            Over&Weer voor jin & leiding.
            Als je de opties hieronder uitvinkt, krijg je geen papieren exemplaar meer in jouw brievenbus. Let wel, de
            tijdschriften worden per gezin gebundeld. Wil je geen tijdschriften meer voor heel jouw gezin, dan moet je
            je
            voorkeuren bij elke lid aangeven.</p>
        </div>
        <div class="col-md-3 d-flex justify-content-center mt-8 ml-8">
          <opslaan @opslaan="opslaan" class="mt-4" :disabled="!changes"></opslaan>
        </div>
      </div>
    </div>
    <div class="row ml-4">
      <div class="col-md-6 ml-8 d-flex justify-content-start border-bottom-1">
        <p class="ml--07">TIJDSCHRIFTEN</p>
      </div>
      <div class="col-md-2 justify-content-start border-bottom-1">
        <p>PER POST</p>
      </div>
      <div class="col-md-2 justify-content-start border-bottom-1">
        <p>PER E-MAIL</p>
      </div>
    </div>
    <div v-for="(product, index) in getCommunicatieProducten" :key="index" class="ml-8 mt-2">
      <!-- Sectie enkel voor de gewone leden - verschillend tov leiding-->
      <div v-if="(product.type.length > 1 && product.naam !== 'Go Scout It') && !leiding" class="row">
        <div class="col-md-1 col-xs-2 align-items-center d-flex ml-4">
          <span><img :src="`${publicPath}static/${product.image}`" class="pictures"></span>
        </div>
        <div class="col-md-2 col-xs-4 align-items-center d-flex text-align-left">
          {{ product.naam }}
        </div>
        <div class="col-md-3 col-xs-12 align-items-center d-flex text-align-left">
          {{ product.omschrijving }}
        </div>
        <div class="col-md-2 mt09">
          <base-checkbox :model-value="checkValue(product, product.type[0])"
                         @check="verwerkCommunicatie(product, product.type[0])"/>
        </div>
        <div class="col-md-2 mt09">
          <base-checkbox :model-value="!checkValue(product, product.type[0]) && checkValue(product, product.type[1])"
                         :disabled="checkValue(product, product.type[0])"
                         @check="verwerkCommunicatie(product, product.type[1])"/>
        </div>
        <div class="col-md-1 col-xs-1 mt-4 d-flex justify-content-start">
          <div class="mt-2">
            <a
              :href="product.link" target="_blank" class="info-button" v-if="product.link">
              <i class="fa fa-question-circle resolve" title="meer info"></i>
            </a>
          </div>
        </div>
      </div>
      <div v-if="product.type.length > 1 && leiding && !product.bijlage" class="row">
        <div class="col-md-1 col-xs-2 ml-4">
          <span><img :src="`${publicPath}static/${product.image}`" class="pictures"></span>
        </div>
        <div class="col-md-2 col-xs-4 align-items-center d-flex text-align-left">
          {{ product.naam }}
        </div>
        <div class="col-md-3 col-xs-12 align-items-center d-flex text-align-left">
          {{ product.omschrijving }}
        </div>
        <div class="col-md-2 mt09">
          <base-checkbox :model-value="checkValue(product, product.type[0])"
                         @check="verwerkCommunicatie(product, product.type[0])"/>
        </div>
        <div class="col-md-2 mt09">
          <base-checkbox :model-value="!checkValue(product, product.type[0]) && checkValue(product, product.type[1])"
                         :disabled="checkValue(product, product.type[0])"
                         @check="verwerkCommunicatie(product, product.type[1])"/>
        </div>
        <div class="col-md-1 col-xs-1 mt-4 d-flex justify-content-start">
          <div class="mt-2">
            <a
              :href="product.link" target="_blank" class="info-button" v-if="product.link">
              <i class="fa fa-question-circle resolve" title="meer info"></i>
            </a>
          </div>
        </div>
      </div>

    </div>
    <div v-if="leiding && getCommunicatieProducten.length > 0" class="row ml-8 mt-2">
      <div class="col-md-1 col-xs-2 control-label ml-4">
        <span><img :src="`${publicPath}static/img/bijlages.png`" class="bijlages"></span>
      </div>
      <div class="col-md-2 col-xs-4 align-items-center d-flex justify-content-md-start text-align-left">
        Bijlages
      </div>
      <div class="col-md-3 col-xs-11 align-items-center d-flex text-align-left">
        (Krak?, Boem!, Go Scout It)
      </div>
      <div class="col-md-2 mt09">
        <base-checkbox :model-value="!checkAantalBijlages('post')"
                       :multiple="true"
                       @check="verwerkBijlage( 'post')"/>
      </div>
      <div class="col-md-2 mt09">
        <base-checkbox :model-value="!checkAantalBijlages('nieuwsbrief') && checkAantalBijlages('post')"
                       :multiple="true"
                       :disabled="!checkAantalBijlages('post')"
                       @check="verwerkBijlage( 'nieuwsbrief')"/>
      </div>
      <div class="col-md-1 col-xs-1 mt-4 d-flex justify-content-start">
        <div class="mt-2">
          <a
            href="https://www.scoutsengidsenvlaanderen.be/tijdschriften/krak-boem" target="_blank" class="info-button">
            <i class="fa fa-question-circle resolve" title="meer info"></i>
          </a>
        </div>
      </div>
    </div>
    <div v-if="communicatieProducten.length > 4">
      <div class="row ml-4 mt-4">
        <div class="col-md-6 ml-8 d-flex justify-content-start border-bottom-1">
          <p class="ml--07">NIEUWSBRIEVEN</p>
        </div>
        <div class="col-md-2 justify-content-start border-bottom-1">
        </div>
        <div class="col-md-2 justify-content-start border-bottom-1 col-xs-offset-4 col-md-offset-4">
          <p>PER E-MAIL</p>
        </div>
      </div>
      <div class="ml-8">
        <div class="row ml-4 mt-4">
          <div v-for="(product, index) in communicatieProducten" :key="index">
            <div v-if="product.type.length === 1 && product.type[0] === 'nieuwsbrief'" class="row mt-2">
              <div class="col-md-1 col-xs-2 control-label">
                <span><img :src="`${publicPath}static/${product.image}`" class="pictures"></span>
              </div>
              <div class="col-md-2 col-xs-4 align-items-center d-flex text-align-left">
                {{ product.naam }}
              </div>
              <div class="col-md-3 col-xs-12 align-items-center d-flex text-align-left mr-4">
                {{ product.omschrijving }}
              </div>
              <div class="col-md-2"></div>
              <div class="col-md-2 mt09">
                <base-checkbox :model-value="checkValue(product, product.type[0])"
                               @check="verwerkCommunicatie(product, product.type[0])"/>
              </div>
              <div class="col-md-1 col-xs-1 mt15">
                <a
                  href="{{product.link}}" target="_blank" class="info-button" v-if="product.link">
                  <i class="fa fa-question-circle resolve" title="meer info"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RestService from "@/services/api/RestService";
import Loader from "@/components/global/Loader";
import Breadcrumb from "primevue/breadcrumb";
import BaseCheckbox from "@/components/input/BaseCheckbox";
import CommunicatieProductService from "@/services/communicatieproducten/CommunicatieProductService";
import Opslaan from "@/components/buttons/Opslaan";
import MessageDialog from "@/components/dialog/MessageDialog";

export default {
  name: "Communicatievoorkeuren",
  components: {
    MessageDialog,
    Opslaan,
    BaseCheckbox,
    Loader,
    Breadcrumb
  },
  data() {
    return {
      communicatieProducten: [],
      selectedCommunicatieProducten: [],
      publicPath: process.env.BASE_URL,
      leiding: false,
      laden: false,
      saving: false,
      messageDialog: false,
      changes: false,
      defaultCommunicatieproductabonnement: {
        communicatieproduct: '',
        type: '',
        lid: ''
      },
      home: {icon: 'pi pi-home', to: '/dashboard'},
      breadcrumbItems: [
        {
          label: 'lid',
          to: '/lid/profiel'
        },
        {
          label: 'Communicatievoorkeuren'
        },
      ],
    }
  },

  computed: {
    getCommunicatieProducten() {
      return this.communicatieProducten;
    }
  },

  methods: {
    checkValue(product, type) {
      return CommunicatieProductService.checkValue(this.selectedCommunicatieProducten, product, type)
    },

    verwerkBijlage(type) {
      if (!this.checkAantalBijlages(type)) {
        if (type === 'post') {
          this.messageDialog = true;
        }
        this.voegBijlageToe(type);
      } else {
        this.verwijderBijlage(type);
      }
    },

    sluiten() {
      this.messageDialog = false;
    },

    verwijderBijlage(type) {
      this.communicatieProducten.forEach(cp => {
        this.selectedCommunicatieProducten.forEach(cpa => {
          if (cp.bijlage && cpa.communicatieproduct === cp.id && cpa.type === type) {
            let index = this.selectedCommunicatieProducten.indexOf(cpa);
            this.selectedCommunicatieProducten.splice(index, 1);
          }
        })
      })
    },

    voegBijlageToe(type) {
      this.communicatieProducten.forEach(cp => {
        if (cp.bijlage && cp.type.includes(type)) {
          let communicatieproductabonnement = Object.assign({}, this.defaultCommunicatieproductabonnement);
          communicatieproductabonnement.communicatieproduct = cp.id;
          communicatieproductabonnement.type = type;
          communicatieproductabonnement.lid = this.$store.getters.profiel.id;
          this.selectedCommunicatieProducten.push(communicatieproductabonnement);
        }
      })
    },

    checkBijlages(type) {
      return CommunicatieProductService.checkBijlages(this.selectedCommunicatieProducten, type);
    },

    checkAantalBijlages(type) {
      return CommunicatieProductService.checkAantalBijlage(this.selectedCommunicatieProducten, type, this.communicatieProducten);
    },

    verwerkCommunicatie(product, type) {
      if ((type === 'post' && this.checkValue(product, 'post')) && !this.showedEmailMessage && this.checkValue(product, 'nieuwsbrief')) {
        this.messageDialog = true;
      }
      this.changes = true;
      let index = -1;
      let communicatieproductabonnement = Object.assign({}, this.defaultCommunicatieproductabonnement);
      communicatieproductabonnement.communicatieproduct = product.id;
      communicatieproductabonnement.type = type;
      communicatieproductabonnement.lid = this.$store.getters.profiel.id;

      this.selectedCommunicatieProducten.forEach(cpa => {
        if (cpa.communicatieproduct === communicatieproductabonnement.communicatieproduct && cpa.type === communicatieproductabonnement.type) {
          index = this.selectedCommunicatieProducten.indexOf(cpa);
        }
      })

      if (index < 0) {
        this.selectedCommunicatieProducten.push(communicatieproductabonnement);
      } else {
        this.selectedCommunicatieProducten.splice(index, 1);
      }


      if (!this.leiding) {
        if (CommunicatieProductService.getAantalBijlagesVanType(this.selectedCommunicatieProducten, type) >= 2 && index < 0) {
          this.communicatieProducten.forEach(communicatieProduct => {
            if (communicatieProduct.naam === 'Go Scout It') {
              communicatieproductabonnement = Object.assign({}, this.defaultCommunicatieproductabonnement);
              communicatieproductabonnement.communicatieproduct = communicatieProduct.id;
              communicatieproductabonnement.type = type;
              communicatieproductabonnement.lid = this.$store.getters.profiel.id;
              this.selectedCommunicatieProducten.push(communicatieproductabonnement);
            }
          })
        } else {
          this.communicatieProducten.forEach(cp => {
            this.selectedCommunicatieProducten.forEach(cpa => {
              if (cp.naam === 'Go Scout It' && cpa.communicatieproduct === cp.id && cpa.type === type) {
                let index = this.selectedCommunicatieProducten.indexOf(cpa);
                this.selectedCommunicatieProducten.splice(index, 1);
              }
            })
          })
        }
      }
    },

    opslaan() {
      this.saving = true;
      RestService.saveCommunicatieProductAbonnement(this.selectedCommunicatieProducten)
        .then(res => {
          if (res.status === 201) {
            this.$toast.add({
              severity: "success",
              summary: "Communicatievoorkeuren",
              detail: "Voorkeur is aangepast.",
              life: 3000,
            });
          }
        })
        .catch(error => {
          this.$toast.add({
            severity: "error",
            summary: "Communicatievoorkeuren",
            detail: error.message,
            life: 8000,
          });
        })
        .finally(() => {
          this.saving = false;
        })
    }
  }
  ,

  mounted() {
    this.laden = true;
    RestService.getCommunicatieProducten()
      .then(res => {
        this.communicatieProducten = res.data.communicatieProducten;
        this.leiding = this.communicatieProducten.length >= 4;
      })

    RestService.getCommunicatieProductAbonnementen()
      .then(res => {
        this.selectedCommunicatieProducten = res.data;
        this.laden = false;
      })
  }
}
</script>

<style scoped>

</style>
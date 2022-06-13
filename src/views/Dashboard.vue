<template>
  <div>
    <SideMenu/>
    <confirmDialog/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div class="container-fluid">
      <div class="hidden lg:block md:ml-8">
        <Breadcrumb class="ml-4 mt-4 md:ml-6"/>
      </div>
      <div class="custom-divider"></div>
      <div class="lg:ml-8 lg:pl-8">
        <div class="content container lg:ml-8">
          <loader :show-loader="showLoader"></loader>
          <div class="d-flex lg:mt-8 sm:mt-4 mt-6">
            <h1 class="welkom-titel text-align-left md:text-center text-sm sm:text-lg md:text-3xl">Welkom {{
                naam
              }}</h1>
          </div>
          <div class="row container-block sm:mt-5">
            <div class="col-12 col-md-10">
              <div class="row">
                <div v-for="menuItem in dashboardItems" :key="menuItem.label" class="col-lg-5 mb-4 dashboard-block">
                  <dashboard-block :link="menuItem.link" :title="menuItem.label" :icoon="menuItem.icon"
                                   :visible="menuItem.condition" :internal="menuItem.internal">
                  </dashboard-block>
                </div>
              </div>
            </div>
            <div class="col-lg-2 justify-content-start d-flex">
              <h5 class="text-align-left"><strong>Snel naar</strong></h5>
              <ul>
                <!--  snel naar items nog aan te vullen  -->
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer/>
</template>

<script>
import Loader from "@/components/global/Loader";
import DashboardBlock from "@/components/global/DashboardBlock";
import Footer from "@/components/global/Footer";
import rechtenService from "@/services/rechten/rechtenService";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

export default {
  name: "Dashboard",
  components: {
    Footer,
    DashboardBlock,
    Loader,
    SideMenu,
    ConfirmDialog,
    IngelogdLid
  },
  data() {
    return {
      showLoader: false,
      gebruiker: null,
      menuItems: [
        {
          label: "Mijn gegevens",
          condition: true,
          icon: "far fa-user",
          link: "Profiel",
          internal: true,
        },
        {
          label: "Individuele steekkaart",
          condition: true,
          icon: "far fa-notes-medical",
          link: "IndividueleSteekkaart",
          internal: true,
        },
        {
          label: "Communicatievoorkeuren",
          condition: true,
          icon: "far fa-satellite-dish",
          link: "Communicatievoorkeuren",
          internal: true,
        },
        {
          label: "Leden",
          condition: "ledenlijst",
          icon: "far fa-users",
          link: "Ledenlijst",
          internal: true,
        },
        {
          label: "Ledenaantallen",
          condition: "groepen",
          icon: "far fa-chart-area",
          link: "Ledenaantallen",
          internal: true,
        },
        {
          label: "Groep",
          condition: "groepen",
          icon: "far fa-cogs",
          link: "Groepsinstellingen",
          internal: true,
        },
        {
          label: "Lidaanvragen",
          condition: "aanvragen",
          icon: "far fa-address-book",
          link: "Aanvragen",
          internal: true,
        },
        {
          label: "Verzekeringen",
          condition: true,
          icon: "far fa-umbrella",
          link: "https://vz.scoutsengidsenvlaanderen.be",
          internal: false,
        },
      ],
    }
  },
  computed: {
    dashboardItems: function () {
      return this.menuItems.filter(obj => {
        return obj.condition === true || rechtenService.hasAccess(obj.condition);
      });
    },
    naam: function () {
      return this.$store.getters.profiel.vgagegevens.voornaam;
    }
  }
};
</script>

<style>
.sidemenu {
  display: block !important;
}
</style>

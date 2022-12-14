<template>
  <div>
    <SideMenu/>
    <confirmDialog/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div class="container-fluid">
      <div class="hidden lg:block md:ml-8 w-50">
        <Breadcrumb class="ml-4 mt-4 md:ml-6"/>
      </div>
      <div class="custom-divider"></div>
      <div class="lg:ml-8 lg:pl-8 mt-2">
        <div class="content container lg:ml-8">
          <loader :show-loader="showLoader"></loader>
          <div class="d-flex lg:mt-8 sm:mt-4 mt-8">
            <h1 class="welkom-titel text-align-left md:text-center text-sm sm:text-lg md:text-3xl mt-2">Welkom {{
                naam
              }}</h1>
          </div>
          <div class="row container-block sm:mt-5">
            <div class="col-12 col-md-9">
              <div class="row">
                <div v-for="menuItem in dashboardItems" :key="menuItem.label" class="col-lg-5 mb-4 dashboard-block">
                  <dashboard-block :link="menuItem.link" :title="menuItem.label" :icoon="menuItem.icon"
                                   :visible="menuItem.condition" :internal="menuItem.internal">
                  </dashboard-block>
                </div>
              </div>
            </div>
            <div class="col-lg-3 mt-2" v-if="snelNaarItems.length > 0">
              <div class="justify-content-start d-flex">
                <h5 class="text-align-left mb-4"><strong>Snel naar</strong></h5>
              </div>
              <div class="justify-content-start d-flex">
                <ul style="list-style: none;" class="ml--1">
                  <li class="text-decoration-none justify-content-start d-flex mb-3 text-align-left"
                      v-for="(item, index) in snelNaarItems" :key="index">
                    <i class="fal fa-arrow-right color-light-green"><a :href="item.url" target="_blank"
                                                                       class="text-decoration-none"><span
                      class="text-black font ml-2 clickable">{{ item.naam }}</span></a></i>
                  </li>
                </ul>
              </div>
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
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import DashboardService from "@/services/dashboard/DashboardService";
import {toRefs} from "@vue/reactivity";

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
  setup() {

    const {
      state,
      dashboardItems,
      naam
    } = DashboardService.dashboardSpace();

    return {
      ...toRefs(state),
      dashboardItems,
      naam
    }
  }
};
</script>

<style>
.sidemenu {
  display: block !important;
}
</style>

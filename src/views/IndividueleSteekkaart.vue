<template>
  <div>
    <SideMenu/>
    <ConfirmDialog/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div>
      <Loader
        :showLoader="isLoadingGegevens"
      ></Loader>
      <div class="lg:ml-6">
        <div class="p-4 lg:ml-8 md:mt-10 lg:mt-4">
          <Button
            icon="pi pi-save"
            class="p-button-rounded p-button-warning float-right mr-2 position-sticky save-button"
            v-show="changes"
            @click="save"
            :class="changes ? 'animate' : ''"
          />
          <div class="row">
            <div
              class="pull-left d-flex flex-column float-left text-align-left lg:ml-3"
            >
              <h3 class="panel-title">Individuele steekkaart</h3>
              <p class="panel-subtitle">
                {{ lid.vgagegevens.voornaam }}
                {{ lid.vgagegevens.achternaam }}
              </p>
              <p class="panel-subtitle">
                Geboortedatum: {{ lid.vgagegevens.geboortedatum }}
              </p>
              <p class="panel-subtitle">
                Laatste aanpassing:
                {{ lid.vgagegevens.individueleSteekkaartdatumaangepast }}
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
import DynamischVeld from "@/components/input/DynamischVeld";
import Loader from "@/components/global/Loader";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import ConfirmDialog from "primevue/confirmdialog";
import SteekkaartService from "@/services/individueleSteekkaart/SteekkaartService";
import {toRefs} from "@vue/reactivity";

export default {
  name: "IndividueleSteekkaart",
  components: {
    DynamischVeld,
    Loader,
    SideMenu,
    ConfirmDialog,
    IngelogdLid
  },
  setup() {
    const {
      state,
      save,
      changeValue,
      setHeader
    } = SteekkaartService.steekkaartSpace();

    return {
      ...toRefs(state),
      save,
      changeValue,
      setHeader
    }
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

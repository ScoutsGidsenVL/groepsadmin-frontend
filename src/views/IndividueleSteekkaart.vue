<template>
  <div>
    <SideMenu />
    <ConfirmDialog />
    <toast position="bottom-right" />
    <ingelogd-lid></ingelogd-lid>
    <PageLayout :breadcrumb-items="breadcrumbItems" :home="home">
      <Loader :showLoader="isLoadingGegevens"></Loader>
      <div class="lg:ml-6">
        <div class="p-4 lg:ml-8 md:mt-10 lg:mt-4">
          <div class="d-flex justify-content-between align-items-end mt-3">
            <div class="d-flex flex-column text-align-left lg:ml-3">
              <h3 class="panel-title">Individuele steekkaart</h3>
              <p class="panel-subtitle">
                {{ lid.vgagegevens.voornaam }}
                {{ lid.vgagegevens.achternaam }}
              </p>
              <p class="panel-subtitle">
                Geboortedatum:
                {{ DateUtil.formatteerDatum(lid.vgagegevens.geboortedatum) }}
              </p>
              <p
                class="panel-subtitle mb-0"
                v-if="
                  lid.vgagegevens.individueleSteekkaartDatumAangepast != null
                "
              >
                Laatste aanpassing:
                {{
                  DateUtil.formatteerDatum(
                    lid.vgagegevens.individueleSteekkaartDatumAangepast
                  )
                }}
              </p>
            </div>
            <Button
              :icon="changes ? 'pi pi-save' : 'far fa-calendar-check'"
              :class="
                changes ? 'p-button opslaan-knop' : 'p-button steekkaart-knop'
              "
              :label="changes ? 'Opslaan' : 'Nagekeken'"
              @click="save"
            />
          </div>
          <div class="row mt-3">
            <div class="col-12">
              <form>
                <accordion :multiple="true" v-model:activeIndex="activeIndex">
                  <accordionTab
                    v-for="(groep, index) in layoutGroepen"
                    :key="index"
                  >
                    <template #header>
                      <div class="d-flex col-12 justify-content-between">
                        <span class="text-align-left">{{
                          groep[0].label
                        }}</span>
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
                      :steekkaart="true"
                      :eigenProfiel="eigenProfiel"
                      class="text-align-left"
                    ></DynamischVeld>
                  </accordionTab>
                </accordion>
              </form>
            </div>
          </div>
          <div class="d-flex justify-content-end mt-3">
            <Button
              :icon="changes ? 'pi pi-save' : 'fal fa-calendar-check'"
              :class="
                changes ? 'p-button opslaan-knop' : 'p-button steekkaart-knop'
              "
              :label="changes ? 'Opslaan' : 'Nagekeken'"
              @click="save"
            />
          </div>
        </div>
      </div>
    </PageLayout>
  </div>
</template>

<script>
import DynamischVeld from "@/components/input/DynamischVeld";
import Loader from "@/components/global/Loader";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import SteekkaartService from "@/services/individueleSteekkaart/SteekkaartService";
import { toRefs } from "@vue/reactivity";
import ConfirmDialog from "primevue/confirmdialog";
import PageLayout from "@/components/global/PageLayout";
import DateUtil from "../services/dates/DateUtil";

export default {
  name: "IndividueleSteekkaart",
  computed: {
    DateUtil() {
      return DateUtil;
    },
  },

  components: {
    DynamischVeld,
    Loader,
    SideMenu,
    IngelogdLid,
    ConfirmDialog,
    PageLayout,
  },
  setup() {
    const {
      state,
      save,
      changeValue,
      setHeader,
    } = SteekkaartService.steekkaartSpace();

    return {
      ...toRefs(state),
      save,
      changeValue,
      setHeader,
    };
  },
};
</script>

<style scoped></style>

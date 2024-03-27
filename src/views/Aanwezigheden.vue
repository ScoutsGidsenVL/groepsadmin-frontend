<template>
  <div>
    <SideMenu/>
    <confirmDialog/>
    <toast position="bottom-right"/>
    <div>
      <ingelogd-lid></ingelogd-lid>
    </div>
      <div class="container-fluid min-height-67vh mt-7em lg:mt-0">
        <div class="hidden lg:block md:ml-8 w-25">
          <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 md:ml-6 mb-8"/>
        </div>
        <Loader
          :showLoader="isLoadingAanwezigheden"
        ></Loader>
        <div class="lg:ml-8">
          <div class="lg:ml-6">
            <label class="d-flex justify-content-start">Aanwezigheden registreren</label>

            <data-table
              ref="ledenlijst"
              :value="sorteerLeden"
              v-model:selection="aanwezigeLeden"
              dataKey="id"
              editMode="cell"
              @cell-edit-complete="bewerkCell"
              rowGroupMode="subheader"
              groupRowsBy="functie.omschrijving"
              sortMode="single"
              sortField="functie.omschrijving"
              :sortOrder="1"
              stripedRows
              showGridlines
              responsiveLayout="stack"
              class="p-datatable-sm mt-4 aanwezighedenTabel"
            >
              <column field="functie.omschrijving" header="Functie"></column>
              <column selectionMode="multiple" headerStyle="width: 3rem"></column>
              <column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" style="width: 25%">
                <template #body="{ data, field }">
                  {{ field === 'prijs' ? formateerBedrag(data[field]) : data[field] }}
                </template>
                <template #editor="{ data, field }">
                  <template v-if="field === 'aantal'">
                    <input-text v-model="data[field]" autofocus />
                  </template>
                  <template v-if="field === 'prijs'">
                    <input-number v-model="data[field]" mode="currency" currency="EUR" locale="de-DE" autofocus />
                  </template>
                </template>
              </column>
              <template #empty>
                Geen leden gevonden.
              </template>
              <template #groupheader="slotProps">
                <div class="flex align-items-center gap-2">
                  <span class="font-bold ml-5">{{ slotProps.data.functie.omschrijving }}</span>
                </div>
              </template>
            </data-table>
          </div>
        </div>
      </div>
  </div>
  <Footer/>
</template>


<script>
import IngelogdLid from "@/components/lid/IngelogdLid.vue";
import SideMenu from "@/components/global/Menu.vue";
import Loader from "@/components/global/Loader.vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {toRefs} from "@vue/reactivity";
import Footer from "@/components/global/Footer.vue";
import AanwezighedenService from "@/services/aanwezigheden/AanwezighedenService";
import InputNumber from "primevue/inputnumber";

export default {
  name: "Aanwezigheden",
  components: {
    Footer,
    Loader,
    ConfirmDialog,
    SideMenu,
    IngelogdLid,
    InputNumber
  },
  setup() {
    const {
      state,
      bewerkCell,
      formateerBedrag,
      sorteerLeden
    } = AanwezighedenService.aanwezighedenSpace();

    return {
      bewerkCell,
      formateerBedrag,
      sorteerLeden,
      ...toRefs(state)
    }
  }
}

</script>


<style scoped>

</style>

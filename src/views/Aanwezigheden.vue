<template>
  <div>
    <SideMenu />
    <confirmDialog
      :message="dialogMessage"
      :header="dialogHeader"
      :dialog-visible="messageDialog"
      @confirm="bevestigVerwijderen"
      @cancel="annuleerVerwijderen"
    />
    <toast position="bottom-right" />
    <div>
      <ingelogd-lid></ingelogd-lid>
    </div>
    <PageLayout :breadcrumb-items="breadcrumbItems" :home="home">
      <Loader :showLoader="isLoadingAanwezigheden"></Loader>
      <div class="lg:ml-8">
        <div class="lg:ml-6">
          <h4 class="text-align-left mt-5 custom-title font-weight-bold">
            Aanwezigheden bewerken
          </h4>
          <label class="d-flex justify-content-start text-gray-500"
            >{{ activiteit.omschrijving }}
          </label>
          <label class="d-flex justify-content-start text-gray-500">
            {{ formatteerDatum(activiteit.van) }} -
            {{ formatteerDatum(activiteit.tot) }}</label
          >
          <data-table
            ref="ledenlijst"
            :value="sorteerLeden"
            v-model:selection="aanwezigeLeden"
            dataKey="id"
            :editMode="magActivteitBeheren ? 'cell' : 'none'"
            @cell-edit-complete="bewerkCell"
            rowGroupMode="subheader"
            sortMode="single"
            :sortOrder="1"
            stripedRows
            showGridlines
            responsiveLayout="stack"
            class="p-datatable-sm mt-4 aanwezighedenTabel"
          >
            <column
              v-for="col of columns"
              :key="col.field"
              :field="col.field"
              :header="col.header"
              style="width: 20%"
            >
              <template #body="{ data, field }">
                {{
                  field === "prijs"
                    ? formatteerBedrag(data[field])
                    : data[field]
                }}
              </template>
              <template
                v-if="col.field === 'aantaldagen' || col.field === 'prijs'"
                #editor="{ data, field }"
              >
                <template v-if="field === 'aantaldagen'">
                  <input-number v-model="data[field]" autofocus />
                </template>
                <template v-if="field === 'prijs'">
                  <input-number
                    v-model="data[field]"
                    mode="currency"
                    currency="EUR"
                    locale="de-DE"
                    autofocus
                  />
                </template>
              </template>
            </column>
            <column
              v-if="magActivteitBeheren"
              field="acties"
              header="Acties"
              style="width: 150px"
            >
              <template #body="slotProps">
                <div class="flex justify-content-between">
                  <i
                    class="fas fa-trash cursor-pointer"
                    style="font-size: 1.5rem"
                    title="Aanwezigheid verwijderen"
                    @click="verwijderAanwezigheid(slotProps.data.id)"
                  ></i>
                </div>
              </template>
            </column>
            <template #empty> Geen leden gevonden. </template>
          </data-table>
        </div>
      </div>
    </PageLayout>
  </div>
</template>

<script>
import IngelogdLid from "@/components/lid/IngelogdLid.vue";
import SideMenu from "@/components/global/Menu.vue";
import Loader from "@/components/global/Loader.vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import { toRefs } from "@vue/reactivity";
import PageLayout from "@/components/global/PageLayout";
import AanwezighedenService from "@/services/aanwezigheden/AanwezighedenService";
import InputNumber from "primevue/inputnumber";

export default {
  name: "Aanwezigheden",
  components: {
    PageLayout,
    Loader,
    ConfirmDialog,
    SideMenu,
    IngelogdLid,
    InputNumber,
  },

  setup() {
    const {
      state,
      bewerkCell,
      formatteerBedrag,
      sorteerLeden,
      formatteerDatum,
      verwijderAanwezigheid,
      bevestigVerwijderen,
      annuleerVerwijderen,
    } = AanwezighedenService.aanwezighedenSpace();

    return {
      bewerkCell,
      formatteerBedrag,
      sorteerLeden,
      formatteerDatum,
      verwijderAanwezigheid,
      bevestigVerwijderen,
      annuleerVerwijderen,
      ...toRefs(state),
    };
  },
};
</script>

<style scoped></style>

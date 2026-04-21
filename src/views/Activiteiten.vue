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
    <activiteitDialog
      :dialog-visible="activiteitDialog"
      @close="close"
      :groep="selectedGroep"
      :te-bewerken-activiteit="teBewerkenActiviteit"
    />
    <attestDialog
      :dialog-visible="attestDialog"
      @close="close"
      :groep="selectedGroep"
      :te-bewerken-activiteit="teBewerkenActiviteit"
    />
    <MessageDialog
      :message="dialogMessage"
      :header="dialogHeader"
      :dialog-visible="geenActiviteitenDialog"
      @close="close"
    />
    <toast position="bottom-right" />
    <div>
      <ingelogd-lid></ingelogd-lid>
    </div>
    <PageLayout :breadcrumb-items="breadcrumbItems" :home="home">
      <Loader :showLoader="isLoadingActiviteiten"></Loader>

      <div class="lg:ml-8">
        <div class="lg:ml-6">
          <h4 class="text-align-left mt-5 custom-title font-weight-bold">
            Betalende activiteiten
          </h4>
          <div class="flex justify-content-between">
            <div
              class="col-12 col-lg-6 col-xl-4 groep-select justify-content-start ml--2"
              v-if="!groepenLaden"
            >
              <BaseDropdown
                :options="groepenArray"
                :model-value="selectedGroep"
                @changeValue="veranderGroep"
              />
            </div>
            <div>
              <Button
                v-if="leden.length > 0"
                type="button"
                :label="
                  leden.length === 1
                    ? '1 lid toevoegen'
                    : leden.length + ' leden toevoegen'
                "
                @click="voegLedenToe(leden)"
                icon="far fa-users"
                class="actie-button mr-1 mt-3"
              />
              <Button
                v-if="magActivteitBeheren"
                :label="
                  leden.length > 0 ? 'Selectie wijzigen' : 'Leden Selecteren'
                "
                @click="$router.push('/ledenlijst')"
                icon="far fa-users"
                class="actie-button mr-1 mt-3"
              />
              <Button
                v-if="magActivteitBeheren"
                type="button"
                label="Nieuwe Activiteit"
                @click="activiteitDialog = true"
                icon="far fa-plus"
                class="actie-button mr-1 mt-3"
              />
              <Button
                v-if="magActivteitBeheren"
                type="button"
                label="Attest Genereren"
                @click="attestDialog = true"
                icon="far fa-search-dollar"
                class="actie-button mr-1 mt-3"
              />
            </div>
          </div>
          <data-table
            ref="activiteitenlijst"
            :value="activiteiten"
            stripedRows
            :scrollable="true"
            showGridlines
            size="small"
            class="p-datatable-sm activiteitentabel"
          >
            <column
              v-if="leden.length > 0"
              headerClass="checkbox-kolom-header"
              style="width: 2rem"
            >
              <template #header>
                <div class="w-full flex justify-content-center"></div>
              </template>
              <template #body="slotProps">
                <div class="flex justify-content-center">
                  <checkbox
                    v-model="geselecteerdeActiviteiten"
                    :value="slotProps.data"
                  ></checkbox>
                </div>
              </template>
            </column>
            <column field="jaar" header="Jaar">
              <template #body="slotProps">
                <div
                  @click="registreerAanwezigheden(slotProps.data.id)"
                  class="cursor-pointer"
                >
                  {{ slotProps.data.van.substring(0, 4) }}
                </div>
              </template>
            </column>
            <column field="periode" header="Periode">
              <template #body="slotProps">
                <div
                  @click="registreerAanwezigheden(slotProps.data.id)"
                  class="cursor-pointer"
                >
                  {{ formatteerPeriode(slotProps.data) }}
                </div>
              </template>
            </column>
            <column field="omschrijving" header="Omschrijving">
              <template #body="slotProps">
                <div
                  @click="registreerAanwezigheden(slotProps.data.id)"
                  class="cursor-pointer ellipsis"
                >
                  {{ slotProps.data.omschrijving }}
                </div>
              </template>
            </column>
            <column field="prijs" header="Prijs">
              <template #body="slotProps">
                <div
                  @click="registreerAanwezigheden(slotProps.data.id)"
                  class="cursor-pointer"
                >
                  {{ slotProps.data.prijs }} €
                </div>
              </template>
            </column>
            <column field="dagprijs" header="Dagprijs">
              <template #body="slotProps">
                <div
                  @click="registreerAanwezigheden(slotProps.data.id)"
                  class="cursor-pointer"
                >
                  {{ slotProps.data.dagprijs }} €
                </div>
              </template>
            </column>
            <column field="aantalAanwezigen" header="Aantal inschrijvingen">
              <template #body="slotProps">
                <div
                  @click="registreerAanwezigheden(slotProps.data.id)"
                  class="cursor-pointer"
                >
                  {{ slotProps.data.aantalAanwezigheden }}
                </div>
              </template>
            </column>
            <column field="acties" header="Acties">
              <template #body="slotProps">
                <div class="flex justify-content-between">
                  <i
                    class="fas fa-users mr-3 cursor-pointer"
                    style="font-size: 1.5rem"
                    title="Aanwezigen bewerken"
                    @click="registreerAanwezigheden(slotProps.data.id)"
                  ></i>
                  <i
                    v-if="magActivteitBeheren"
                    class="fas fa-pencil mr-3 cursor-pointer"
                    style="font-size: 1.5rem"
                    title="Activiteit bewerken"
                    @click="wijzigActiviteit(slotProps.data)"
                  ></i>
                  <i
                    v-if="magActivteitBeheren"
                    class="fas fa-trash cursor-pointer"
                    style="font-size: 1.5rem"
                    title="Activiteit verwijderen"
                    @click="verwijderActiviteit(slotProps.data.id)"
                  ></i>
                </div>
              </template>
            </column>
            <template #empty> Geen activiteiten gevonden. </template>
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
import ActiviteitenService from "@/services/activiteiten/ActiviteitenService";
import PageLayout from "@/components/global/PageLayout";
import ActiviteitDialog from "@/components/dialog/ActiviteitDialog.vue";
import AttestDialog from "@/components/dialog/AttestDialog.vue";
import MessageDialog from "@/components/dialog/MessageDialog";
import BaseDropdown from "@/components/input/BaseDropdown.vue";
import rechtenService from "@/services/rechten/rechtenService";

export default {
  name: "Aanvragen",
  components: {
    BaseDropdown,
    PageLayout,
    Loader,
    ConfirmDialog,
    SideMenu,
    IngelogdLid,
    ActiviteitDialog,
    AttestDialog,
    MessageDialog,
  },

  data() {
    return {
      geselecteerdeLeden: [],
      leden: [],
    };
  },
  created() {
    if (
      this.$store.getters.geselecteerdeLeden &&
      this.$store.getters.geselecteerdeLeden.length > 0 &&
      this.$store.getters.geselecteerdeLeden[0].waarden !== undefined
    ) {
      this.sorteerLeden = true;
      this.$store.getters.geselecteerdeLeden.forEach((lid) => {
        this.geselecteerdeLeden.push(lid);
        this.leden.push({
          voornaam:
            lid.waarden["be.vvksm.groepsadmin.model.column.VoornaamColumn"],
          achternaam:
            lid.waarden["be.vvksm.groepsadmin.model.column.AchternaamColumn"],
          volledigenaam:
            lid.waarden[
              "be.vvksm.groepsadmin.model.column.VolledigeNaamColumn"
            ],
          id: lid.id,
        });
      });
      this.sorteerLeden = false;
    } else {
      this.leden = [];
    }
  },

  computed: {
    magActivteitBeheren() {
      return rechtenService.kanWijzigen(this.selectedGroep);
    },
  },

  setup() {
    const {
      state,
      registreerAanwezigheden,
      wijzigActiviteit,
      veranderGroep,
      verwijderActiviteit,
      bevestigVerwijderen,
      annuleerVerwijderen,
      formatteerPeriode,
      isWaardeTrue,
      isWaardeFalse,
      voegLedenToe,
      close,
    } = ActiviteitenService.activiteitenSpace();

    return {
      ...toRefs(state),
      registreerAanwezigheden,
      wijzigActiviteit,
      veranderGroep,
      verwijderActiviteit,
      bevestigVerwijderen,
      annuleerVerwijderen,
      formatteerPeriode,
      isWaardeTrue,
      isWaardeFalse,
      voegLedenToe,
      close,
    };
  },
};
</script>

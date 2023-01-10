<template>
  <div>
    <SideMenu/>
    <confirmDialog/>
    <toast position="bottom-right"/>
    <ingelogd-lid></ingelogd-lid>
    <div class="container-fluid md:w-90 ">
      <div class="hidden lg:block md:ml-8 w-50">
        <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 md:ml-6"/>
      </div>
      <Loader
        :showLoader="isLoadingAanvragen"
      ></Loader>
      <confirm-dialog :dialog-visible="confirmDialog" :header="confirmHeader" :message="confirmMessage" :type="type"
                      @confirm="bevestig" @cancel="annuleer"></confirm-dialog>
      <confirm-mailing :dialog-visible="confirmMailingDialog" :header="confirmMailingHeader"
                       :message="confirmMailingMessage" @bevestigMail="bevestigMail(true)"
                       @bevestigGeenMail="bevestigMail(false)"></confirm-mailing>
      <div class="lg:ml-6 md:mt-10 lg:mt-8">
        <div class="d-flex justify-content-end">
          <lid-zoek-auto-complete></lid-zoek-auto-complete>
        </div>
        <data-table :value="aanvragen" v-model:expandedRows="expandedRows" dataKey="id" responsiveLayout="scroll"
                    class="lg:ml-8">
          <template #header>
            <div class="table-header-container d-flex">
              <Button v-show="!openDetails" icon="pi pi-plus" label="Alles openvouwen" @click="expandAll"
                      class="p-mr-2 approve-button"/>
              <Button v-show="openDetails" icon="pi pi-minus" label="Alles dichtvouwen" @click="collapseAll"
                      class="p-mr-2 approve-button"/>
            </div>
          </template>
          <column :expander="true" headerStyle="width: 3rem"/>
          <column field="aangepast" header="Aangevraagd op" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.aangepast) }}
            </template>
          </column>
          <column field="groepsnummer" header="Groep" sortable></column>
          <column field="geboortedatum" header="Geboortedatum" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.geboortedatum) }}
            </template>
          </column>
          <column header="Naam" sortable>
            <template #body="slotProps">
              <span>{{ toonVolledigeNaam(slotProps.data) }}</span>
            </template>
          </column>
          <template #expansion="slotProps">
            <div class="pl-4em col-12">
              <p class="mb-0">{{ slotProps.data.adres.straat }} {{ slotProps.data.adres.nummer }}</p>
              <p class="mb-0">{{ slotProps.data.adres.land }} {{ slotProps.data.adres.postcode }}
                {{ slotProps.data.adres.gemeente }}</p>
              <p class="mb-0"><a :href="'tel:' + slotProps.data.gsmnummer"
                                 class="clickable clean-link custom-title">{{ slotProps.data.gsmnummer }}</a></p>
              <p class="mb-0"><a :href="'mailto:' + slotProps.data.email"
                                 class="clickable clean-link custom-title">{{ slotProps.data.email }}</a></p>
              <p class="mb-0 p-text-italic"><strong>{{ slotProps.data.opmerkingen }}</strong></p>
              <div class="d-flex justify-content-start mt-3">
                <Button
                  label="Afkeuren"
                  class="mr-2 reject-button"
                  title="Afkeuren"
                  @click="afkeuren(slotProps.data)"
                />
                <Button
                  label="Goedkeuren"
                  class="mr-2 approve-button"
                  title="Goedkeuren"
                  @click="goedkeuren(slotProps.data)"
                />
              </div>
            </div>
          </template>
        </data-table>
      </div>
    </div>
  </div>
</template>

<script>
import RestService from "@/services/api/RestService";
import DateUtil from "@/services/dates/DateUtil";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import ConfirmMailing from "@/components/aanvraag/ConfirmMailing";
import Loader from "@/components/global/Loader";
import Breadcrumb from "primevue/breadcrumb";
import SideMenu from "@/components/global/Menu";
import IngelogdLid from "@/components/lid/IngelogdLid";
import LidZoekAutoComplete from "@/components/global/LidZoekAutoComplete";

export default {
  name: "Aanvragen",
  components: {
    LidZoekAutoComplete,
    ConfirmMailing,
    Loader,
    Breadcrumb,
    ConfirmDialog,
    SideMenu,
    IngelogdLid
  },
  data() {
    return {
      home: {icon: 'pi pi-home', to: '/dashboard'},
      breadcrumbItems: [
        {
          label: 'aanvragen'
        },
      ],
      aanvragen: [],
      expandedRows: [],
      selectedAanvraag: null,
      openDetails: false,
      isLoadingAanvragen: false,
      confirmDialog: false,
      type: "",
      confirmHeader: "",
      confirmMessage: "",
      confirmMailingHeader: "",
      confirmMailingDialog: false,
      confirmMailingMessage: "",
      defaultLid: null,
    }
  },

  created() {
    this.getAanvragen();
  },

  methods: {
    getAanvragen() {
      this.isLoadingAanvragen = true;
      RestService.getAanvragen()
        .then(res => {
          this.aanvragen = res.data.aanvragen;
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.isLoadingAanvragen = false;
        })
    },

    collapseAll() {
      this.expandedRows = null;
      this.openDetails = false;
    },

    expandAll() {
      this.expandedRows = this.aanvragen.filter(a => a.id);
      this.openDetails = true;
    },

    formatDate(date) {
      return DateUtil.formatteerDatum(date);
    },

    formatGeboorteDatum(geboortedatum) {
      return DateUtil.formatGeboortedatum(geboortedatum)
    },

    toonVolledigeNaam(row) {
      return row.voornaam + " " + row.achternaam;
    },

    goedkeuren(aanvraag) {
      this.$store.commit("setGoedTeKeurenLid", null)
      this.defaultLid = {
        vgagegevens: {
          voornaam: aanvraag.voornaam,
          achternaam: aanvraag.achternaam,
          verminderdlidgeld: aanvraag.verminderdlidgeld,
          geboortedatum: aanvraag.geboortedatum
        },
        persoonsgegevens: aanvraag.persoonsgegevens,
        email: aanvraag.email,
        verbondsgegevens: {
          lidgeldbetaald: false
        },
        id: aanvraag.id,
        adressen: aanvraag.adressen,
        contacten: aanvraag.contacten,
        groepsnummer: aanvraag.groepsnummer,
        groepseigenGegevens: aanvraag.groepseigenGegevens,
      }
      aanvraag.links.forEach(link => {
        if (link.rel === "goedkeuren") {
          this.defaultLid.lidaanvraag = link;
        }
      })
      this.$store.commit("setGoedTeKeurenLid", this.defaultLid);
      this.$router.push({name: "lidToevoegen"});
    },

    afkeuren(aanvraag) {
      this.selectedAanvraag = aanvraag;
      this.type = "afkeuren";
      this.confirmDialog = true;
      this.confirmHeader = "Afkeuren aanvraag";
      this.confirmMessage = "Ben je zeker dat je deze aanvraag wil afkeuren?";
    },

    bevestig(type) {
      if (type === "afkeuren") {
        this.confirmMailingHeader = "Lidaanvraag verwijderen";
        this.confirmMailingDialog = true;
        this.confirmMailingMessage = "Wil je deze persoon mailen via <strong>" + this.selectedAanvraag.email + "</strong>?";
      }
    },

    annuleer() {
      this.confirmDialog = false;
      this.confirmHeader = "";
      this.confirmMessage = "";
      this.selectedAanvraag = null;
    },

    bevestigMail(mail) {
      this.deleteAanvraag(mail);
    },

    deleteAanvraag(mail) {
      this.isLoadingAanvragen = true;
      RestService.verwijderAanvraagMail(this.selectedAanvraag.id, mail)
        .then(() => {
          this.confirmDialog = false;
          this.confirmMailingDialog = false;
          this.getAanvragen();
          this.$toast.add({
            severity: "success",
            summary: "Wijzigingen",
            detail: "Lidaanvraag is verwijderd",
            life: 3000,
          });
        })
        .catch(error => {
          this.$toast.add({
            severity: "error",
            summary: "Wijzigingen",
            detail: error.message,
            life: 8000,
          });
        })
        .finally(() => {
          this.isLoadingAanvragen = false;
        })
    }
  }
}
</script>

<style scoped>

</style>

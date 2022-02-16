<template>
  <div class="container-fluid md:w-90">
    <div class="hidden lg:block md:ml-8">
      <Breadcrumb :home="home" :model="breadcrumbItems" class="ml-4 mt-4 lg:ml-6"/>
    </div>
    <Loader
      :showLoader="isLoadingData"
    ></Loader>
    <div class="lg:ml-8">
      <div class="lg:ml-8">
        <div class="row bovenbalk mt-7 mb-8">
          <label class="d-flex justify-content-start">Ledenaantallen van: </label>
          <div class="col-12 col-lg-6 col-xl-8 groep-select" v-if="!groepenLaden">
            <BaseDropdown
              :options="groepenArray"
              :model-value="selectedGroep"
              @changeValue="veranderGroep"
            />
          </div>
          <label class="d-flex justify-content-start">Type tabel: </label>
          <div class="col-12 col-lg-6 col-xl-8 groep-select" v-if="!groepenLaden">
            <BaseDropdown
              :options="graphOptions"
              :model-value="selectedGraph"
              @changeValue="veranderGraph"
            />
          </div>
          <div
            class="col-12 col-lg-6 col-xl-4 d-flex justify-content-start"
            v-if="groepenLaden"
          >
            <span class="mt-1">Groepen laden &nbsp;<i class="fas fa-spinner fa-spin"></i></span></div>
        </div>
        <div>
          <div class="col-9 pr-8 mt-8 absolute" v-if="ledenaantallenData">
            <div id="Ledenaantallen" class="col-2 col-md-4" v-if="selectedGraph === 'Ledenaantallen'">
              <div class="d-flex justify-content-center" v-if="ledenaantallenData.takStatistieken.length === 0">
                <label>Geen gegevens beschikbaar</label>
              </div>
              <table class="table" v-if="ledenaantallenData.takStatistieken.length > 0">
                <thead>
                <tr>
                  <th>Tak</th>
                  <th>Aantal leden</th>
                  <th>Historiek</th>
                  <th>% Vrouwen</th>
                  <th>Aantal leiding</th>
                  <th>Historiek</th>
                  <th>Omkaderingscijfer</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(takStatistiek, key) in ledenaantallenData.takStatistieken" :key="key">
                  <td>{{ takStatistiek.takNaam }}</td>
                  <td>{{ takStatistiek.aantalLeden['Nu'] }}</td>
                  <td><Chart type="bar" :data="eigenschappenData(takStatistiek.aantalLeden).data"
                             :options="eigenschappenData(takStatistiek.aantalLeden).options" class="historiek-chart"/></td>
                  <td>{{ round(takStatistiek.percentageVrouwelijkeLeden, 0) }}</td>
                  <td>{{ takStatistiek.aantalLeiding['Nu'] }}</td>
                  <td><Chart type="bar" :data="eigenschappenData(takStatistiek.aantalLeiding).data"
                             :options="eigenschappenData(takStatistiek.aantalLeiding).options" class="historiek-chart"/></td>
                  <td>{{ round(takStatistiek.omkaderingscijfer, 1) }}</td>
                </tr>
                </tbody>
              </table>
            </div>
            <div id="Eigenschappen" v-if="selectedGraph === 'Eigenschappen'">
              <table class="table">
                <thead>
                <tr>
                  <th class="text-align-left">Criteria</th>
                  <th class="text-align-left">Waarde</th>
                  <th class="text-align-left">Historiek</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(criterium, key) in ledenaantallenData.criteria" :key="key">
                  <td class="text-align-left">{{ criterium.naam }}</td>
                  <td class="text-align-left">{{ format(criterium.waarden['Nu'], criterium.formaat) }}</td>
                  <td>
                    <Chart type="bar" :data="eigenschappenData(criterium.waarden).data"
                           :options="eigenschappenData(criterium.waarden).options" class="historiek-chart"/>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div id="Groepsevolutie" v-if="selectedGraph === 'Groepsevolutie'">
              <Chart type="line" :data="getGroepsevolutie.data" :options="getGroepsevolutie.options" class="w-75"/>
            </div>
            <div id="Ledenaantal per leeftijd" v-if="selectedGraph === 'Ledenaantal per leeftijd'">
              <Chart type="bar" :data="getLeeftijdsAantallen.data" :options="getLeeftijdsAantallen.options"
                     class="w-75"/>
            </div>
            <div id="Huidige leidingservaring" v-if="selectedGraph === 'Huidige leidingservaring'">
              <Chart type="doughnut" :data="getLeidingservaring.data" :options="getLeidingservaring.options"
                     class="w-75"/>
            </div>
            <div id="Instroom en uitstroom per leeftijd" v-if="selectedGraph === 'Instroom en uitstroom per leeftijd'">
              <Chart type="bar" :data="getInUitStroom.data" :options="getInUitStroom.options" class="w-75"/>
            </div>
            <div id="Instroom" v-if="selectedGraph === 'Instroom per leeftijd'">
              <Chart type="bar" :data="getInStroom.data" :options="getInStroom.options" class="w-75"/>
            </div>
            <div id="Uitstroom" v-if="selectedGraph === 'Uitstroom per leeftijd'">
              <Chart type="bar" :data="getUitStroom.data" :options="getUitStroom.options" class="w-75"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "primevue/chart";
import BaseDropdown from "@/components/input/BaseDropdown";
import RestService from "@/services/api/RestService";
import Loader from "@/components/global/Loader";
import LedenAantallenService from "@/services/aantallen/LedenAantallenService";

export default {
  name: "LedenAantallen",
  components: {
    Chart,
    BaseDropdown,
    Loader
  },
  data() {
    return {
      selectedGroep: {},
      selectedGraph: "Ledenaantallen",
      graphOptions: [
        {label: "Ledenaantallen", value: "Ledenaantallen"},
        {label: "Eigenschappen", value: "Eigenschappen"},
        {label: "Groepsevolutie", value: "Groepsevolutie"},
        {label: "Ledenaantal per leeftijd", value: "Ledenaantal per leeftijd"},
        {label: "Huidige leidingservaring", value: "Huidige leidingservaring"},
        {label: "Instroom en uitstroom per leeftijd", value: "Instroom en uitstroom per leeftijd"},
        {label: "Instroom per leeftijd", value: "Instroom per leeftijd"},
        {label: "Uitstroom per leeftijd", value: "Uitstroom per leeftijd"},
      ],
      groepenArray: [],
      isLoadingData: false,
      home: {icon: 'pi pi-home', to: '/dashboard'},
      breadcrumbItems: [
        {
          label: 'groep'
        },
      ],
      ledenaantallenData: null
    }
  },
  methods: {
    veranderGraph(graph) {
      this.selectedGraph = graph;
    },
    veranderGroep(groep) {
      this.selectedGroep = groep;
      this.getGroepData();
    },
    format(value, formaat) {
      let waarde = this.round(value, parseInt(formaat.substring(2)));
      return formaat.replace(/[^f]+f/, waarde).replace('%%', '%');
    },
    round(value, digits) {
      if (value) {
        let factor = Math.pow(10, digits);
        return Math.round(factor * value) / factor;
      } else {
        return value;
      }
    },
    getGroepData() {
      this.isLoadingData = true;
      RestService.getLedenAantallen(this.selectedGroep.groepsnummer)
        .then(res => {
          this.ledenaantallenData = res.data
        })
        .catch(error => {
          console.log(error);
        }).finally(() => {
        this.isLoadingData = false;
      })
    },
    eigenschappenData(waarden) {
      return LedenAantallenService.eigenschappen(waarden)
    },
  },
  mounted() {
    this.isLoadingData = true;
    this.selectedGroep = this.groepen[0];
    this.groepen.forEach((groep) => {
      this.groepenArray.push({
        label: groep.naam + " - " + groep.id,
        value: groep,
      });
    });
    if (this.selectedGroep && this.selectedGroep.groepsnummer) {
      this.getGroepData();
    }
  },
  computed: {
    getLeeftijdsAantallen() {
      console.log(LedenAantallenService.getLedenaantalPerLeeftijd(this.ledenaantallenData));
      return LedenAantallenService.getLedenaantalPerLeeftijd(this.ledenaantallenData);
    },

    getGroepsevolutie() {
      return LedenAantallenService.getGroepsevolutie(this.ledenaantallenData)
    },

    getLeidingservaring() {
      return LedenAantallenService.tekenHuidigeLeidingsErvaring(this.ledenaantallenData);
    },

    getInUitStroom() {
      return LedenAantallenService.tekenInEnUitstroom(this.ledenaantallenData);
    },

    getInStroom() {
      return LedenAantallenService.tekenInstroom(this.ledenaantallenData);
    },

    getUitStroom() {
      return LedenAantallenService.tekenUitstroom(this.ledenaantallenData);
    },

    groepenLaden() {
      return this.$store.getters.groepenLaden;
    },

    groepen() {
      return this.$store.getters.groepen;
    },
  }
};
</script>

<style scoped></style>

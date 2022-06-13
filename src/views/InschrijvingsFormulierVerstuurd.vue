<template>
  <div class="container ">
    <div class="row">
      <div class="">
        <div class="col-xs-3 col-sm-3 col-md-1 image-box col-md-offset-3">
          <!-- logo scouts en gidsen -->
        </div>
        <div class="request-box col-xs-7 col-sm-9 col-md-6 message-box">
          <div class="request-title">
            Je aanvraag om lid te worden van {{ groep ? groep.naam : '' }} <br/><br/>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="text-box col-xs-10 col-sm-12 col-md-7 col-md-offset-3">
        <br/>
        Beste {{voornaam}},<br/><br/>
        Fijn dat je wil aansluiten bij Scouts en Gidsen Vlaanderen.<br/>
        Je aanvraag om lid te worden is verzonden naar de verantwoordelijke.<br/>
        Je zal een bericht ontvangen van de groep als je aanvraag verwerkt is.
        <br/><br/>Met vriendelijke scouts- en gidsen groeten.<br/><br/>
      </div>
    </div>
  </div>
</template>

<script>

import RestService from "@/services/api/RestService";

export default {
  name: "InschrijvingsFormulier",
  data() {
    return {
      groep: null,
      groepsnummer: '',
      voornaam: '',
    }
  },

  mounted() {
    this.groepsnummer = this.$route.params.groep;
    if (this.groepsnummer) {
      this.getGroepData();
    }
    this.voornaam = this.$store.getters.kandidaatLid;
  },

  methods: {
    getGroepData() {
      RestService.getGroepOpNummer(this.groepsnummer)
        .then(res => {
          this.groep = res.data;
        }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: "Groep ophalen",
          detail: error.message,
          life: 8000,
        });
      })
    }
  }

};
</script>

<style scoped>
</style>

<template>
  <Loader></Loader>
  <Dialog
    v-model:visible="openDialog"
    :style="{
      width: '550px',
    }"
    class="activiteit-dialog"
    :modal="true"
    :closable="false"
  >
    <template #header>
      <div class="inline-flex align-items-center justify-content-start gap-2 header-background">
        <span class="font-bold white-space-nowrap">Fiscaal attest genereren</span>
      </div>
    </template>
    <div class="activiteit-content">
      <h4>Groep</h4>
      <div>Vul hier de toegangscode in die je van Belcotax ontving:</div><br/>
      <BaseInput
        v-model="attest.kbo"
        label="Pseudo-KBO-nummer"
        type="text"
        :invalid="v.attest.kbo.$dirty && v.attest.kbo.$invalid"
        :error-message="v.attest.kbo.required.$message"
      />
      <hr/>
      <h4>Erkenings instantie</h4>
      <div>
        <div style="float: right;">
          <Button
            label="Aanpassen"
            @click="aanpassen"
            class="p-button-text approve-button"
          />
        </div>
        <div v-if="groep.instantie">
          <div>Julie erkenings instantie is momenteel:<br/><br/>
          <b>Naam:</b> {{ attest.certnaam }}<br/>
          <b>KBO:</b>  {{ attest.certkbo }}<br/><br/>
          <b>Adres:</b><br/>{{ attest.certadres }}<br/>
          {{ attest.certpostcode + " " + attest.certgemeente}}</div>
        </div>
        <div v-else>
          Voeg eerst de gegevens van je Erkenings Instelling toe.
        </div>
      </div>
      <hr/>
    </div>
    <template #footer>
      <Button
        label="Annuleer"
        icon="pi pi-times"
        @click="$emit('close')"
        class="p-button-text reject-button"
      />
      <Button
        label="Genereer Attest"
        v-if=groep.instantie
        @click="genereer"
        class="p-button-text approve-button"
      />
    </template>
  </Dialog>
</template>

<script>
  import BaseInput from "@/components/input/BaseInput.vue";
  import {toRefs, watch } from 'vue';
  import Loader from "@/components/global/Loader.vue";
  import ActiviteitenService from "@/services/activiteiten/ActiviteitenService";

  export default {
    name: "MessageDialog",
    components: { Loader, BaseInput },
    props: {
      dialogVisible: { type: Boolean, default: false },
      groep: { type: Object },
    },
    methods: {
      genereer() {
        this.genereerAttest();
      },
      aanpassen() {
        this.$router.push({ path: 'groepsinstellingen' });
      },
    },
    setup(props) {
      const {
        state,
        v,
        openDialog,
        genereerAttest,
      } = ActiviteitenService.attestenDialogSpace(props);

      watch(
        () => props.groep,
        (nieuweGroep) => {
          if (nieuweGroep?.instantie && state?.attest) {
            state.attest.certnaam = nieuweGroep.instantie.naam;
            state.attest.certadres = nieuweGroep.instantie.adres.straat + " " + nieuweGroep.instantie.adres.nummer + " " + nieuweGroep.instantie.adres.bus;
            state.attest.certpostcode = nieuweGroep.instantie.adres.postcode;
            state.attest.certgemeente = nieuweGroep.instantie.adres.gemeente;
            state.attest.certkbo = nieuweGroep.instantie.kbo;
          }
        },
        { immediate: true, deep: true }
      );

      return {
        ...toRefs(state),
        v,
        openDialog,
        genereerAttest,
      };
    },
  };
</script>

<style scoped>

</style>
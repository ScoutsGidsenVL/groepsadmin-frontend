<template>
  <div class="uittreksel-strafregister-card mb-4">
    <card>
      <template #title>
        <span class="font22">{{ title }}</span>
      </template>
      <template #content>
        <div class="p-fluid mt-2">
          <BaseInput
            v-model="statusLabel"
            :disabled="true"
            label="Status"
            type="text"
          ></BaseInput>
          <BaseInput
            v-model="datumTekst"
            :disabled="true"
            :label="datumLabel"
            label-class="label-nowrap"
            type="text"
          ></BaseInput>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import BaseInput from "@/components/input/BaseInput";
import UittrekselStrafregisterService from "@/services/uittrekselStrafregister/UittrekselStrafregisterService";
import useEmitter from "@/services/utils/useEmitter";
import DateUtil from "@/services/dates/DateUtil";

export default {
  name: "UittrekselStrafregister",
  components: {
    BaseInput,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    lidId: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const emitter = useEmitter();
    const statusOpties = [
      { label: "Niet ingediend", value: "NIET_INGEDIEND" },
      { label: "Ingediend", value: "INGEDIEND" },
      { label: "Goedgekeurd", value: "GOEDGEKEURD" },
      { label: "Geweigerd", value: "GEWEIGERD" },
      { label: "Verlopen", value: "VERLOPEN" },
    ];
    const status = ref("NIET_INGEDIEND");
    const datum = ref(null);

    const datumLabels = {
      INGEDIEND: "Datum indiening",
      GEWEIGERD: "Datum weigering",
      GOEDGEKEURD: "Datum uittreksel",
      VERLOPEN: "Datum uittreksel",
    };
    const datumLabel = computed(() => datumLabels[status.value] || "Datum");

    const statusLabel = computed(() => {
      const optie = statusOpties.find((o) => o.value === status.value);
      return optie ? optie.label : status.value;
    });

    const datumTekst = computed(() =>
      datum.value ? DateUtil.formatteerDatum(datum.value) : "-"
    );

    // Lid.vue houdt deze gegevens zelf niet bij (die leven hier), maar heeft
    // ze wel nodig om de gele balk te verbergen/aan te passen. Enkel hier
    // (en niet bv. via een watch met immediate) doorsturen, op het moment
    // dat alles effectief gekend is: anders zou de balk eerst kort tonen op
    // basis van de voorlopige standaardwaarde hierboven, nog voor de eerste
    // GET geantwoord heeft.
    const meldStatusGekend = (bijnaVerlopen) => {
      emitter.emit("strafregisterStatusChanged", {
        status: status.value,
        bijnaVerlopen: !!bijnaVerlopen,
      });
    };

    const vervaldatum = (datumWaarde) => {
      const resultaat = new Date(datumWaarde);
      resultaat.setFullYear(resultaat.getFullYear() + 3);
      return resultaat;
    };

    const meerDanDrieJaarGeleden = (datumWaarde) => {
      return vervaldatum(datumWaarde) < new Date();
    };

    // Binnen de 30 dagen vóór de 3-jaar-vervaldatum
    const bijnaDrieJaarGeleden = (datumWaarde) => {
      const dagenTotVervaldatum =
        (vervaldatum(datumWaarde) - new Date()) / (1000 * 60 * 60 * 24);
      return dagenTotVervaldatum >= 0 && dagenTotVervaldatum <= 30;
    };

    // De backend stuurt de status in kleine letters, de opties hier staan
    // in hoofdletters
    const verwerkGegevens = (data) => {
      if (data && data.status) {
        status.value = data.status.toUpperCase();
      }
      if (data && data.datum) {
        datum.value = new Date(data.datum);
      }
      let bijnaVerlopen = false;
      if (status.value === "GOEDGEKEURD" && datum.value) {
        // Een goedgekeurd uittreksel van meer dan 3 jaar oud telt niet meer
        if (meerDanDrieJaarGeleden(datum.value)) {
          status.value = "VERLOPEN";
        } else if (bijnaDrieJaarGeleden(datum.value)) {
          bijnaVerlopen = true;
        }
      }
      meldStatusGekend(bijnaVerlopen);
    };

    const haalStrafregisterOp = (lidId) => {
      if (!lidId) {
        return;
      }
      UittrekselStrafregisterService.haalStrafregisterOp(lidId)
        .then((res) => {
          verwerkGegevens(res.data);
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            status.value = "NIET_INGEDIEND";
            datum.value = null;
            meldStatusGekend(false);
          }
        });
    };

    watch(
      () => props.lidId,
      (lidId) => {
        haalStrafregisterOp(lidId);
      },
      { immediate: true }
    );

    // Lid.vue stuurt de respons van het opladen door, zodat hier niet
    // opnieuw opgehaald moet worden
    emitter.on("strafregisterOpgeladen", (data) => {
      verwerkGegevens(data);
    });

    return { statusLabel, datumTekst, datumLabel };
  },
};
</script>

<style scoped></style>
